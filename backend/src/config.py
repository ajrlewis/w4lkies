import os

from loguru import logger
from pydantic_settings import BaseSettings

DEFAULT_ALLOW_ORIGINS = ",".join(
    [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://w4lkies.com",
        "https://www.w4lkies.com",
    ]
)
DEFAULT_ALLOW_ORIGIN_REGEX = r"^https://w4lkies-frontend(?:-[a-z0-9-]+)*\.vercel\.app$"


def _get_env_or_default(name: str, default: str) -> str:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip() or default


class Settings(BaseSettings):
    SQLALCHEMY_DATABASE_URI: str = os.getenv(
        "SQLALCHEMY_DATABASE_URI", ""
    ) or os.getenv("POSTGRES_URL", "")
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "")
    PROJECT_DESCRIPTION: str = os.getenv("PROJECT_DESCRIPTION", "")
    PROJECT_SUMMARY: str = os.getenv("PROJECT_SUMMARY", "")
    PROJECT_VERSION: str = os.getenv("PROJECT_VERSION", "")
    PROJECT_LICENSE: str = os.getenv("PROJECT_LICENSE", "")
    PROJECT_LICENSE_URL: str = os.getenv("PROJECT_LICENSE_URL", "")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30)
    MAIL_SERVER: str = os.getenv("MAIL_SERVER", "")
    MAIL_USERNAME: str = os.getenv("MAIL_USERNAME", "")
    MAIL_PASSWORD: str = os.getenv("MAIL_PASSWORD", "")
    MAIL_DEFAULT_SENDER_NAME: str = os.getenv("MAIL_DEFAULT_SENDER_NAME", "")
    MAIL_FROM_NAME: str = os.getenv("MAIL_DEFAULT_SENDER_NAME", "")
    MAIL_PORT: int = os.getenv("MAIL_PORT", 587)
    ALLOW_ORIGINS: str = _get_env_or_default("ALLOW_ORIGINS", DEFAULT_ALLOW_ORIGINS)
    ALLOW_ORIGIN_REGEX: str = _get_env_or_default(
        "ALLOW_ORIGIN_REGEX", DEFAULT_ALLOW_ORIGIN_REGEX
    )


settings = Settings()
