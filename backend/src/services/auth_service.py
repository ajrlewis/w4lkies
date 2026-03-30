from datetime import datetime, timedelta, timezone
from typing import Union

import jwt

from config import settings
from cruds import user_crud
from dependencies import GetDBDep
from services import password_service


def authenticate_user(db: GetDBDep, name: str, password: str):
    user = user_crud.get_user_by_name(db, name)
    if not user:
        return False
    if not password_service.verify_password(password, user.password_hash):
        return False
    return user


def create_access_token(data: dict, expires_delta: Union[timedelta, None] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt
