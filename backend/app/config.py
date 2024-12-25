import os

from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()


class AppSettings(BaseSettings):
    MISTRAL_API_KEY: str


settings = AppSettings(MISTRAL_API_KEY=os.getenv("MISTRAL_API_KEY"))
