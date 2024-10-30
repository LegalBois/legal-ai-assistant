from langchain_openai import ChatOpenAI
from src.config import settings



legal_ai_chain = ChatOpenAI(
    openai_api_key=settings.OPENAI_API_KEY,
    temperature=0,
    streaming=True,
)
