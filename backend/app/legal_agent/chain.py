import logging
from time import sleep, time

import chromadb
import nltk
from langchain.retrievers import EnsembleRetriever
from langchain_chroma import Chroma
from langchain_community.retrievers import BM25Retriever
from langchain_core.prompts import (
    PromptTemplate,
)
from langchain_core.rate_limiters import InMemoryRateLimiter
from langchain_core.runnables import RunnableLambda, RunnableParallel
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_mistralai.chat_models import ChatMistralAI
from langsmith import traceable
from nltk.tokenize import word_tokenize

from ..config import settings
from .structured_output import Rephrases

# STEP 0: Initialization

# About RPS with Mistral:
# On their cite RPS = 1 sec, but in reality the rate limit error
# can occurs even when time between requests about 3-4 sec, so it's not exact 1 sec.
# Langchain has rate limiter, f.e. `InMemoryRateLimiter`, which can retries requests
# when error occurred. BUT don't work with Runnables which called with .stream() or .astream()
# In this chain we have 2 or 3 model invokations (based on path).
# I made it so that streaming model call will be only at the final generation -
# and there I added a custom function to allocate a certain time between API requests.
# And all other model calls I made not via stream (but manually .invoke), so that the built-in rate limiter would work in them

WAIT_BW_API_REQ = 3  # Wait time between last API call and final stremed API call
RPS = 1  # `Real` RPS on Mistral cite (used in langchain RateLimiter)

rate_limiter = InMemoryRateLimiter(
    requests_per_second=(RPS - 0.25),
    check_every_n_seconds=0.1,  # Wake up every 100 ms to check whether allowed to make a request,
    max_bucket_size=10,  # Controls the maximum burst size.
)

# Logging configuration
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Set up little cache
mem = {
    "query": "",
    "last_mistral_api_req": 0,
}


def save_api_invokation_time(x):
    """
    Just saves Mistral API request time into mem.
    """
    mem["last_mistral_api_req"] = time()
    return x


@traceable
def check_rps(x):
    """
    Monitors time between Mistral API calls, in order to not exceed RPS.
    """
    logger.info("Checking Mistral RPS violations...")

    time_since_last_call = time() - mem.get("last_mistral_api_req", 0)
    logger.info("Time since last Mistral API request: %.2f seconds", time_since_last_call)

    if time_since_last_call < WAIT_BW_API_REQ:
        sleep_duration = WAIT_BW_API_REQ - time_since_last_call
        logger.info("RPS limit exceeded, sleeping for %.2f seconds", sleep_duration)
        sleep(sleep_duration)

    mem["last_mistral_api_req"] = time()
    logger.info("Continue RAG pipeline.")

    return x


# STEP 1: Query classification
# Classify user query on whether it requires legal assistance
# If query doesnt requires assistance, then just answer w/o going to the vector DB for context

# Classification model
cls_llm = ChatMistralAI(
    api_key=settings.MISTRAL_API_KEY,
    model_name="mistral-large-latest",
    temperature=0.6,
    streaming=False,
    max_tokens=5,
).with_retry(
    retry_if_exception_type=(Exception,), wait_exponential_jitter=True, stop_after_attempt=5
)

# Load system prompt for classification
with open("/app/app/legal_agent/prompts/cls_prompt.txt", "r") as f:
    cls_prompt = PromptTemplate.from_template(f.read())


def prepare_input(query: str):
    """
    Helper function, which save original query and wrap it into dict.
    """
    mem["query"] = query
    return {"input": query}


cls_chain = (
    prepare_input
    | cls_prompt
    | RunnableLambda(lambda x: cls_llm.invoke(x))
    | save_api_invokation_time
)

# STEP 2-0: Chat response on non-legal assistance request

# Chat response model
chat_llm = ChatMistralAI(
    api_key=settings.MISTRAL_API_KEY,
    model_name="mistral-large-latest",
    temperature=0.8,
    streaming=True,
)

# Load system prompt
with open("/app/app/legal_agent/prompts/chat_prompt.txt", "r") as f:
    chat_prompt = f.read()

non_legal_chat_chain = (
    RunnableLambda(lambda x: chat_prompt + mem["query"])
    | check_rps
    | chat_llm
)

# STEP 2-1-0: Creating queries for retrieval

# Queries generation model
queries_gen_llm = (
    ChatMistralAI(
        api_key=settings.MISTRAL_API_KEY,
        model_name="mistral-large-latest",
        temperature=0.8,
        streaming=False,
    )
    .with_structured_output(Rephrases)
    .with_retry(
        retry_if_exception_type=(Exception,), wait_exponential_jitter=True, stop_after_attempt=5
    )
)

# Load system prompt
with open("/app/app/legal_agent/prompts/queries_gen_prompt.txt", "r") as f:
    queries_gen_prompt = PromptTemplate.from_template(f.read())


@traceable
def queries_validation(rephrases: Rephrases | None) -> list[str]:
    """
    Validates the generated rephrases and construct the list of queries for retrieval.
    """
    logger.info("Starting validation of generated rephrases")
    try:
        if rephrases and rephrases.rephrases:
            logger.info(f"Rephrases are valid: {rephrases.rephrases}")
            rephrases.rephrases.append(mem["query"])
            return rephrases.rephrases
        else:
            logger.info(
                f"Rephrases not valid, we'll use only original user query for retrieval: {mem['query']}"
            )
            return [mem["query"]]
    except Exception as e:
        logger.error("An error occurred during validation of rephrases: ", e, exc_info=True)
        return [mem["query"]]


queries_gen_chain = (
    RunnableLambda(lambda x: queries_gen_prompt.invoke({"input": mem["query"]}))
    | RunnableLambda(lambda x: queries_gen_llm.invoke(x))
    | save_api_invokation_time
    | queries_validation
)

# STEP 2-1-1: Retrieval and post-processing

# Load embedding model
emb_model_path = "/app/emb_model/USER-bge-m3/"
logger.info(f"Load locally saved embedding model: USER-bge-m3 from {emb_model_path}.")
emb_model = HuggingFaceEmbeddings(model_name=emb_model_path)
logger.info("Successfully load embedding model.")

# Set up ChromaDB
logger.info("Starting ChromaDB setup...")
chroma_client = chromadb.PersistentClient(path="/app/storage")
practices_store = Chroma(
    client=chroma_client,
    collection_name="legal_practices",
    embedding_function=emb_model,
)
docs_store = Chroma(
    client=chroma_client,
    collection_name="legal_docs",
    embedding_function=emb_model,
)

nltk.download("punkt_tab")  # Tokenizer for BM-25 retriever
logger.info("Creating retrievers... (typically ~5 min)")

# For legal practices collection
practices_simil_retr = practices_store.as_retriever(
    search_type="similarity", search_kwargs={"k": 3}
)
practices_data_for_bm25 = practices_store.get(include=["documents", "metadatas"])
practices_bm25_retr = BM25Retriever.from_texts(
    texts=practices_data_for_bm25["documents"],
    metadatas=practices_data_for_bm25["metadatas"],
    preprocess_func=word_tokenize,
    k=1,
)
del practices_data_for_bm25  # Release memory
practices_ensemble_retriever = EnsembleRetriever(
    retrievers=[practices_simil_retr, practices_bm25_retr],
    weights=[0.5, 0.5],
)

# For legal docs (codexes and laws) collection
docs_simil_retr = docs_store.as_retriever(search_type="similarity", search_kwargs={"k": 3})
docs_data_for_bm25 = docs_store.get(include=["documents", "metadatas"])
docs_bm25_retr = BM25Retriever.from_texts(
    texts=docs_data_for_bm25["documents"],
    metadatas=docs_data_for_bm25["metadatas"],
    preprocess_func=word_tokenize,
    k=1,
)
del docs_data_for_bm25  # Release memory
docs_ensemble_retriever = EnsembleRetriever(
    retrievers=[docs_simil_retr, docs_bm25_retr],
    weights=[0.5, 0.5],
)
logger.info("Vector DB and retrievers successfully loaded.")


@traceable
def context_post_processing(retrieve_results: dict) -> dict:
    """
    Post-processing of retrieved relevant legal practices and docs.
    Steps:
        1. Legal practices:
            a. Picks up the most relevant doc for each query (3) w/o duplicates
            b. Add 'theme' from metadata of doc to its content
            c. Merge
        2. Legal docs (codexes and laws):
            a. Picks up the most relevant doc for each query (3) w/o duplicates
            b. Add doc 'title' from metadata of doc to its content
            c. Merge
        3. Final merge of 3 legal practices and 3 legal docs

    Params:
        `retrieve_results` - combine retrive results from ensemble retriever of 2 vector DB
    """
    # 1. Legal practices

    # Pick top document for each query without duplicates
    texts = set()
    # retrieve_results['practice'] is a list of lists (docs per query)
    for query_docs in retrieve_results["practice"]:
        for doc in query_docs:
            doc_text = f"{doc.metadata.get('theme', '')}\n{doc.page_content}"
            if doc_text not in texts:
                texts.add(doc_text)
                break

    # Merge all docs
    practices_context = "\n\n".join(t for t in texts)

    # 2. Legal docs

    # Pick top document for each query without duplicates
    texts = set()
    # retrieve_results['docs'] is a list of lists (docs per query)
    for query_docs in retrieve_results["docs"]:
        for doc in query_docs:
            doc_text = f"{doc.metadata.get('title', '')}\n{doc.page_content}"
            if doc_text not in texts:
                texts.add(doc_text)
                break

    # Merge all docs
    docs_context = "\n\n".join(t for t in texts)

    # 3. Final merge
    context = f"<Похожие судебные дела>:\n{practices_context}\n<Похожие юридические документы>:\n{docs_context}"

    return {"context": context, "query": mem["query"]}


retrieval_chain = (
    RunnableParallel(
        {"practice": practices_ensemble_retriever.batch, "docs": docs_ensemble_retriever.batch}
    )
    | context_post_processing
)

# STEP 2-1-2: Legal assistance generation

# Legal assistance generation model
legal_gen_llm = ChatMistralAI(
    api_key=settings.MISTRAL_API_KEY,
    model_name="mistral-large-latest",
    temperature=0.7,
    streaming=True)

# Load system prompt
with open("/app/app/legal_agent/prompts/legal_gen_prompt.txt", "r") as f:
    legal_gen_prompt = PromptTemplate.from_template(f.read())

legal_gen = legal_gen_prompt | check_rps | legal_gen_llm

# FULL CHAIN

rag_chain = queries_gen_chain | retrieval_chain | legal_gen


@traceable
def route(cls_res):
    """
    Route execution based on classification step.
    """
    if cls_res.content in ("1", '"1"', "'1'") or (cls_res.content and cls_res.content[0] == "1"):
        logger.info("Query classified as legal, routing to the RAG pipeline.")
        return rag_chain
    else:
        logger.info("Queary classified as non-legal, so answer without retrieve context from DB.")
        return non_legal_chat_chain


legal_ai_chain = cls_chain | route
