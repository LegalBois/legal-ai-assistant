# legal-ai-assistant

Демо сайт может быть найден по ссылке: http://147.45.241.38:5173/

## Description

### [Frontend](/frontend/)

...

### [Backend](/backend/)

Бэк реализован с помощью `langserve`.

### [RAG](/backend/app/legal_agent/)

* Эмбеддинг модель: `deepvk/USER-bge-m3`
* LLM: `mistral-large-latest`
* DB: `ChromaDB`, ~50k документов [судебных практик](/https://sudact.ru/), ~50 юридических документов (основные [кодексы](https://github.com/LegalBois/legal-ai-assistant/blob/databases/docs/codexes.json), [законы](https://github.com/LegalBois/legal-ai-assistant/blob/databases/docs/laws.json))

Пайплайн RAG системы:

![rag](/media/legal_rag.png)

#### Данные

[Описание](https://github.com/LegalBois/legal-ai-assistant/tree/databases) - пайплайн для получения, обработки данных, а также создания векторной базы данных `ChromaDB` с двумя отдельными коллекциями:

1. Коллекция с юридическими документами: основными кодексами и законами
2. Коллекция с документами судебных практик

## How to set up docker compose

1. Move volumes with embedding model (`/emb_model`) and with vector storage (`/storage`) in root directory.

   * `/emb_model` creation:

   ```cmd
   mkdir emb_model &&
   cd emb_model &&
   git clone https://huggingface.co/deepvk/USER-bge-m3
   ```

   * `/storage/` creation: description [here](https://github.com/LegalBois/legal-ai-assistant/tree/databases?tab=readme-ov-file#databases-pipeline)

2. Run `docker compose build`

3. Run `docker compose up`

## How to run the project

1. Clone the repository
2. Add .env file to the backend folder with the following content:

```
MISTRAL_API_KEY=<YOUR_MISTRAL_API_KEY>
```

3. Run the following commands for backend:

3.1. **Install Poetry:**
   If you haven't already, install Poetry by following the instructions from the [Poetry documentation](https://python-poetry.org/docs/#installation).

3.2 **Install Project Dependencies:**
   Navigate to the root directory of the project and run:

   ```bash
   poetry install
   ```

3.3 **Activate the Virtual Environment:**

   ```bash
   poetry shell
   ```

3.4 Local development usage

   ```bash
   uvicorn app.main:app --reload
   ```

4. Run the following commands for frontend:

Install Node.js from [Node.js website](https://nodejs.org/en/), if you haven't already.

4.1 Navigate to the frontend folder

   ```bash
   cd frontend
   ```

4.2 Install the dependencies

   ```bash
    npm install
   ```

4.3 Start the frontend

   ```bash
    npm run dev
   ```
