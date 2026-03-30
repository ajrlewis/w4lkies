FROM python:3.12-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_PROGRESS_BAR=off \
    PYTHONPATH=/app/backend/src

WORKDIR /app/backend

COPY backend/requirements.txt ./requirements.txt

RUN python -m pip install -r requirements.txt

COPY backend/ ./

EXPOSE 8000

FROM base AS dev
RUN python -m pip uninstall -y watchfiles || true
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload", "--reload-dir", "/app/backend/src", "--loop", "asyncio", "--http", "h11"]

FROM base AS prod
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--loop", "asyncio", "--http", "h11"]
