import os

from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()
print("Loaded .env file")
print("OPENAI_API_KEY:", os.getenv("OPENAI_API_KEY"))

class AppSettings(BaseSettings):
    OPENAI_API_KEY: str



settings = AppSettings()
