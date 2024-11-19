import os

from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class AppSettings(BaseSettings):
    OPENAI_API_KEY: str



settings = AppSettings()
