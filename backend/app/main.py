from fastapi import FastAPI
from langserve import add_routes
from starlette.middleware.cors import CORSMiddleware

from app import __version__
from app.legal_agent.chain import legal_ai_chain

app = FastAPI(
    title="Legal AI Server",
    version=__version__,
    description="Legal AI API using Langchain",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

add_routes(
    app,
    legal_ai_chain,
    path="/legal",
)


if __name__ == "__main__":
    # for development
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
