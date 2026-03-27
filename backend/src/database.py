"""
source .env; python3 tests/test_submit_contact_form.py
"""

import os

from loguru import logger
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URI = os.getenv("SQLALCHEMY_DATABASE_URI") or os.getenv(
    "POSTGRES_URL"
)
if SQLALCHEMY_DATABASE_URI and SQLALCHEMY_DATABASE_URI.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI.replace(
        "postgres://", "postgresql+psycopg2://", 1
    )

if not SQLALCHEMY_DATABASE_URI:
    message = (
        "Database URL not set. Expected SQLALCHEMY_DATABASE_URI or POSTGRES_URL."
    )
    logger.error(message)
    raise ValueError(message)

engine = create_engine(SQLALCHEMY_DATABASE_URI)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
