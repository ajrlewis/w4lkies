from typing import Optional

from loguru import logger

from database import SessionLocal
from models import Dog


def get_dogs(db: SessionLocal) -> list[Dog]:
    return db.query(Dog).all()


def get_dog_by_id(db: SessionLocal, dog_id: int) -> Optional[Dog]:
    return db.query.get(Dog, dog_id)
