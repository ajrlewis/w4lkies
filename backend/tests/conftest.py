import os
import re
from pathlib import Path
from unittest.mock import patch

import httpx
import pytest
from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url


def _resolve_test_database_url() -> str:
    explicit = os.getenv("TEST_DATABASE_URL")
    if explicit:
        return explicit

    app_db_url = os.getenv(
        "SQLALCHEMY_DATABASE_URI",
        "postgresql+psycopg2://postgres:postgres@db:5432/w4lkies",
    )
    url = make_url(app_db_url)
    database_name = url.database or "w4lkies"
    if not database_name.endswith("_test"):
        database_name = f"{database_name}_test"
    return url.set(database=database_name).render_as_string(hide_password=False)


TEST_DATABASE_URL = _resolve_test_database_url()
os.environ["SQLALCHEMY_DATABASE_URI"] = TEST_DATABASE_URL


def _validate_database_name(database_name: str) -> None:
    if not re.fullmatch(r"[A-Za-z0-9_]+", database_name):
        raise RuntimeError(
            f"Unsafe test database name '{database_name}'. "
            "Use only letters, numbers, and underscores."
        )


def _recreate_test_database(test_database_url: str) -> None:
    test_url = make_url(test_database_url)
    database_name = test_url.database
    if not database_name:
        raise RuntimeError("Missing database name in test database URL.")
    _validate_database_name(database_name)

    admin_url = test_url.set(database="postgres")
    admin_engine = create_engine(
        admin_url.render_as_string(hide_password=False),
        isolation_level="AUTOCOMMIT",
    )
    try:
        with admin_engine.connect() as connection:
            connection.execute(
                text(
                    """
                    SELECT pg_terminate_backend(pid)
                    FROM pg_stat_activity
                    WHERE datname = :db_name
                      AND pid <> pg_backend_pid()
                    """
                ),
                {"db_name": database_name},
            )
            connection.execute(text(f'DROP DATABASE IF EXISTS "{database_name}"'))
            connection.execute(text(f'CREATE DATABASE "{database_name}"'))
    finally:
        admin_engine.dispose()


def _run_migrations() -> None:
    config = Config(str(Path(__file__).resolve().parents[1] / "alembic.ini"))
    command.upgrade(config, "head")


def _seed_test_database() -> None:
    from database import SessionLocal
    from scripts.seed_db import seed_database

    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()


@pytest.fixture(scope="session", autouse=True)
def prepare_test_database() -> None:
    _recreate_test_database(TEST_DATABASE_URL)
    _run_migrations()
    _seed_test_database()


@pytest.fixture(scope="session", autouse=True)
def disable_email_side_effects():
    with (
        patch("routers.auth_router.send_email", lambda *args, **kwargs: None),
        patch("routers.contact_us_router.send_email", lambda *args, **kwargs: None),
        patch("routers.customer_sign_up_router.send_email", lambda *args, **kwargs: None),
    ):
        yield


@pytest.fixture(scope="session")
def app(prepare_test_database, disable_email_side_effects):
    from main import app

    return app


def _build_auth_headers(access_token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {access_token}"}


@pytest.fixture
async def async_client(app):
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(
        transport=transport, base_url="http://testserver"
    ) as client:
        yield client


@pytest.fixture
async def admin_headers(async_client: httpx.AsyncClient) -> dict[str, str]:
    response = await async_client.post(
        "/auth/token",
        data={"username": "admin", "password": "admin123"},
    )
    assert response.status_code == 200, response.text
    return _build_auth_headers(response.json()["access_token"])


@pytest.fixture
async def user_headers(async_client: httpx.AsyncClient) -> dict[str, str]:
    response = await async_client.post(
        "/auth/token",
        data={"username": "alice", "password": "alice123"},
    )
    assert response.status_code == 200, response.text
    return _build_auth_headers(response.json()["access_token"])
