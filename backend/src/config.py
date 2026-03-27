import os

from loguru import logger
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    SQLALCHEMY_DATABASE_URI: str = os.getenv("SQLALCHEMY_DATABASE_URI", "")
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
    ALLOW_ORIGINS: str = os.getenv("ALLOW_ORIGINS", "http://127.0.0.1:8080")


settings = Settings()
