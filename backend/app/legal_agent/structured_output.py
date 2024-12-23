from typing import Literal, Optional, Union

from pydantic import BaseModel, Field


class RAGQueries(BaseModel):
    """
    Данные, сформированные на основе запроса пользователя для поиска релевантных документов по юридической практике в векторной БД
    Необходимы для уточнения запроса и повышения релевантности выдачи
    """

    keyinfo: Optional[str] = Field(description="Ключевая информация")
    rephrase: Optional[str] = Field(
        description="Перефразированный запрос в векторную базу данных, содержащую судебные дела",
    )
    codex: Optional[
        Literal["Гражданский кодекс", "Уголовный кодекс", "Административный кодекс"]
    ] = Field(
        default=None,
        description="Фильтр для уточнения правового поля запроса, используемый при обращении к векторной базе данных, если возможно определить",
    )


class ChitChatResponse(BaseModel):
    """
    Ответ на запрос пользователя, который не предполагает юридической консультации.
    """

    response: Optional[str] = Field(description="Ответ на общий или неюридический запрос пользователя.")


class FirstResponse(BaseModel):
    """
    Итоговый результат обработки запроса пользователя.
    В зависимости от характера запроса результат может быть представлен в двух форматах:
    - RAGQueries: используется для юридических запросов. Содержит структурированные данные для обращения к векторной базе с целью поиска релевантных документов.
    - ChitChatResponse: применяется для общих или неюридических запросов. Содержит текстовый ответ на запрос пользователя.
    """

    response: Union[RAGQueries, ChitChatResponse] = Field(union_mode="smart",
        description="""Итоговый результат обработки запроса пользователя. 
    Форматы ответа:
    - RAGQueries: для юридических запросов, содержит структурированные данные для поиска документов в векторной базе.
    - ChitChatResponse: для общих запросов, содержит текстовый ответ.""",
    )