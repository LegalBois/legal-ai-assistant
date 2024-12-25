from typing import List
from pydantic import BaseModel, Field

class Rephrases(BaseModel):
    """Перефразированные запросы пользователя, необходимы для уточнения запроса и повышения релевантности выдачи"""
    rephrases: List[str] = Field(description="Список из двух различных перефразированных запроса пользователя")