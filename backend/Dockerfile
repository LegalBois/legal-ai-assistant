FROM tiangolo/uvicorn-gunicorn-fastapi:python3.10-slim AS python-base

# - python
ENV PYTHONUNBUFFERED=1 \
    # prevents python creating .pyc files
    PYTHONDONTWRITEBYTECODE=1 \
    # - pip
    PIP_NO_CACHE_DIR=off \
    PIP_DISABLE_PIP_VERSION_CHECK=on \
    PIP_DEFAULT_TIMEOUT=100 \
    # - poetry
    # make poetry install to this location
    POETRY_HOME="/opt/poetry" \
    # make poetry create the virtual environment in the project's root
    # it gets named `.venv`
    POETRY_VIRTUALENVS_IN_PROJECT=true \
    # do not ask any interactive question
    POETRY_NO_INTERACTION=1 \
    POETRY_REQUESTS_TIMEOUT=100 \
    # - paths
    # this is where our requirements + virtual environment will live
    PYSETUP_PATH="/opt/pysetup" \
    VENV_PATH="/opt/pysetup/.venv"


# Prepend poetry and venv to PATH
ENV PATH="$POETRY_HOME/bin:$VENV_PATH/bin:$PATH"

# Install system dependencies
RUN apt-get update && \
    apt-get install -y \
    build-essential \
    curl \
    software-properties-common

# Install Poetry
RUN pip install poetry==1.4.2
FROM python-base AS requirement_install
WORKDIR $PYSETUP_PATH
COPY ./poetry.lock ./pyproject.toml ./
RUN poetry config virtualenvs.create false
RUN poetry install --no-root --only main

FROM requirement_install AS production
WORKDIR /app

COPY . .
EXPOSE 80

# Volume with ChromaDB collections storage
VOLUME /app/storage/

# Volume with pre-loaded embedding model
VOLUME /app/emb_model/

# Gunicorn env
ENV GUNICORN_CMD_ARGS="--workers=1"
