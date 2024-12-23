import os

from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class AppSettings(BaseSettings):
    MISTRAL_API_KEY: str



settings = AppSettings(MISTRAL_API_KEY=os.getenv("MISTRAL_API_KEY"))
