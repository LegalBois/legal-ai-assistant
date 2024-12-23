import json
import logging
from operator import itemgetter

import chromadb
from langchain_chroma import Chroma
from langchain_core.prompts import ChatPromptTemplate, FewShotChatMessagePromptTemplate
from langchain_core.runnables import Runnable, RunnableLambda
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_mistralai.chat_models import ChatMistralAI
from langsmith import traceable

from ..config import settings
from .structured_output import ChitChatResponse, FirstResponse, RAGQueries

# ===== Logging Configuration =====
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# ===== Initialization =====
logger.info("Initializing models and settings.")
models_settings = {
    "llm": {
        "model_name": "mistral-large-latest",
        "api_key": settings.MISTRAL_API_KEY,
        "temperature": 0.7,
    },
    "emb_model": {"model_name": "deepvk/USER-bge-m3"},
}

llm = ChatMistralAI(**models_settings["llm"])

emb_model_path = "/app/emb_model/USER-bge-m3/"
logger.info(
    f"Load locally saved embedding model: {models_settings['emb_model']} from {emb_model_path}."
)
emb_model = HuggingFaceEmbeddings(model_name=emb_model_path)
logger.info("Successfully load embedding model.")

# ===== Query Analysis =====
logger.info("Loading prompts and examples for query analysis.")
with open("/app/app/legal_agent/prompts/system_prompt_1.txt") as f:
    system_prompt_1 = f.read()

with open("/app/app/legal_agent/prompts/examples_1.json") as f:
    examples_1 = json.load(f)

example_prompt_1 = ChatPromptTemplate.from_messages(
    [
        ("user", "{input}"),
        ("assistant", "{output}"),
    ]
)

few_shot_prompt_1 = FewShotChatMessagePromptTemplate(
    example_prompt=example_prompt_1,
    examples=examples_1,
)

prompt_1 = ChatPromptTemplate.from_messages(
    [
        ("system", system_prompt_1),
        few_shot_prompt_1,
        ("user", "{query}"),
    ]
)

llm_1 = llm.with_structured_output(FirstResponse)
chain_1 = prompt_1 | llm_1

# ===== Retrieval and Final Generation =====
logger.info("Setting up ChromaDB and retriever.")

# Set up ChromaDB with legal practices docs
# Note: this DB should already be initialized
persistent_client = chromadb.PersistentClient(path="/app/storage")
legal_practices_store = Chroma(
    client=persistent_client,
    collection_name="legal_practices",
    embedding_function=emb_model,
)

# Create retriever
# Note: k = 3, because we pick the most relevant `unique` doc for each query (we have 3 queries)
legal_practices_retriever = legal_practices_store.as_retriever(
    search_type="similarity", search_kwargs={"k": 3}
)


@traceable
def create_queries(inputs: dict) -> dict:
    """
    Creates 2 queries for retriever:
        1. Original user query
        2. Key info + query rephrase

    Params:
        `inputs` - output from previous LangChain Runnable in chain
    """
    logger.info("Creating queries from inputs.")
    original_query: str = inputs["query"]
    llm_processed: RAGQueries = inputs["response_1"].response

    queries = [original_query, llm_processed.keyinfo + "\n" + llm_processed.rephrase]
    logger.debug(f"Generated queries: {queries}")
    return {"queries": queries, "codex_filter": llm_processed.codex}


@traceable
def batch_query(inputs: dict) -> dict:
    """
    Makes batch invoke of retriever for each query. 
    Also set the filter for codex (if it's not None).

    Params:
        `inputs` - output from previous LangChain Runnable in chain
    """
    logger.info("Executing batch queries against the retriever.")
    # Add/remove codex filter for retriever
    codex_poss_values = ["А", "АГ", "АУ", "АГУ", "Г", "ГУ", "У"]
    if inputs["codex_filter"] and inputs["codex_filter"][0] in "АГУ":
        legal_practices_retriever.search_kwargs["filter"] = {
            "codex": {"$in": [val for val in codex_poss_values if inputs["codex_filter"][0] in val]}
        }
        logger.debug(f"Applied codex filter: {legal_practices_retriever.search_kwargs['filter']}")
    else:
        legal_practices_retriever.search_kwargs.pop("filter", None)
        logger.debug("No codex filter applied.")

    relevant_docs = legal_practices_retriever.batch(inputs["queries"])
    logger.info(f"Retrieved {len(relevant_docs)} documents.")
    return {"relevant_docs": relevant_docs, "orig_query": inputs["queries"][0]}


@traceable
def prepare_docs(inputs) -> dict:
    """
    Post-proce1ssing of retrieved relevant docs.
    Steps:
        1. Picks up the most relevant docs for each query w/o duplicates
        2. Add `theme` from metadata of doc to its content
        3. Merges all docs in one string

    Params:
        `inputs` - output from previous LangChain Runnable in chain
    """
    logger.info("Preparing documents by post-processing retrieved results.")
    relevant_docs = inputs["relevant_docs"]
    # Pick top document for each query without duplicates
    seen_uids = set()
    top_docs = []

    for query_docs in relevant_docs:  # relevant_docs is a list of lists (docs per query)
        for doc in query_docs:
            uid: str = doc.metadata.get("uid")
            if uid not in seen_uids:
                seen_uids.add(uid)
                top_docs.append(doc)
                break

    # Merge `theme` into `page_content`
    for doc in top_docs:
        theme = doc.metadata.get("theme", "")
        doc.page_content = f"{theme}\n{doc.page_content}"
    
    # Merge all docs
    context = "\n\n".join(doc.page_content for doc in top_docs)
    logger.info("Documents prepared and merged into context.")
    return {"context": context, "orig_query": inputs["orig_query"]}


logger.info("Loading system prompt for final generation.")
with open("/app/app/legal_agent/prompts/system_prompt_2.txt") as f:
    system_prompt_2 = f.read()

prompt_2 = ChatPromptTemplate.from_messages(
    [
        ("system", system_prompt_2),
        ("user", "{orig_query}\n===\n{context}"),
    ]
)

llm_2 = ChatMistralAI(**models_settings["llm"], streaming=True)

chain_2 = (
    RunnableLambda(create_queries)
    | RunnableLambda(batch_query)
    | RunnableLambda(prepare_docs)
    | prompt_2
    | llm_2
)


@traceable
def route(inputs) -> str | Runnable:
    """
    Swithes behavior of pipeline based on query classification:
        1. If LLM classify query as chit-chat - we just return the text response without doing RAG
        2. Otherwise, if query belongs to legal field - execute `chain_2` for RAG

    Params:
        `inputs` - output from previous LangChain Runnable in chain
    """
    logger.info("Routing query based on classification.")
    if isinstance(inputs["response_1"].response, ChitChatResponse):
        logger.info("Query classified as chit-chat.")
        return inputs["response_1"].response.response
    else:
        logger.info("Query classified as legal; executing chain_2.")
        return chain_2


def wrap_input(input):
    """
    Костыль
    Wrap the single input into a dictionary with the key 'input'.
    """
    return {"query": input}


legal_ai_chain = (
    RunnableLambda(wrap_input)
    | {"response_1": chain_1, "query": itemgetter("query")}
    | RunnableLambda(route)
)