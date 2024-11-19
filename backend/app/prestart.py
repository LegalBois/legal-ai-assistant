from langchain_community.vectorstores import FAISS
from langchain_core.embeddings import DeterministicFakeEmbedding
from langchain_community.docstore.in_memory import InMemoryDocstore
import faiss


def create_vector_store(data):
    embeddings = DeterministicFakeEmbedding(size=4096)
    index = faiss.IndexFlatL2(len(embeddings.embed_query("hello world")))
    vector_store = FAISS(
        embedding_function=embeddings,
        index=index,
        docstore=InMemoryDocstore(),
        index_to_docstore_id={},
    )
    return vector_store
