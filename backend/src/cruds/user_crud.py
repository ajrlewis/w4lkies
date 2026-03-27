from typing import Optional

import bcrypt
from loguru import logger
from fastapi import Response
from sqlalchemy.exc import IntegrityError

from database import SessionLocal
from models import User
from exceptions import ConflictError, DatabaseError, NotFoundError
from schemas.user_schema import UserCreateSchema, UserUpdateSchema
from schemas.pagination_schema import PaginationParamsSchema
from pagination import paginate


def get_users(
    db: SessionLocal,
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    pagination_params: Optional[PaginationParamsSchema] = None,
    response: Optional[Response] = None,
) -> list[User]:
    query = db.query(User)
    if is_active is not None:
        query = query.filter_by(is_active=is_active)

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            (User.name.ilike(search_term)) | (User.email.ilike(search_term))
        )

    query = query.order_by(User.name.asc())

    if pagination_params and response:
        return paginate(query, pagination_params, response)

    users = query.all()
    return users


def get_user_by_name(db: SessionLocal, name: str) -> Optional[User]:
    return db.query(User).filter_by(name=name).first()


def get_user_by_email(db: SessionLocal, email: str) -> Optional[User]:
    return db.query(User).filter_by(email=email).first()


def get_user_by_id(db: SessionLocal, user_id: int) -> User:
    user = db.get(User, user_id)
    if not user:
        raise NotFoundError(f"No user found with user_id {user_id}.")
    return user


def add_user(db: SessionLocal, current_user: User, user_data: UserCreateSchema) -> User:
    username = user_data.username.strip()
    email = str(user_data.email).strip().lower()

    if get_user_by_name(db, username):
        raise ConflictError("A user with this username already exists.")
    if get_user_by_email(db, email):
        raise ConflictError("A user with this email already exists.")

    password_hash = bcrypt.hashpw(
        user_data.password.encode("utf-8"), bcrypt.gensalt()
    ).decode("utf-8")

    user = User(
        name=username,
        email=email,
        password_hash=password_hash,
        is_admin=user_data.is_admin,
        is_active=user_data.is_active,
        created_by=current_user.user_id,
        updated_by=current_user.user_id,
    )

    try:
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    except IntegrityError as e:
        db.rollback()
        logger.error(f"User create conflict: {e}")
        raise ConflictError("A user with this username or email already exists.")
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating user: {e}")
        raise DatabaseError("An error occurred while creating a user.")


def update_user_by_id(
    db: SessionLocal,
    current_user: User,
    user_id: int,
    user_data: UserUpdateSchema,
) -> User:
    try:
        user = get_user_by_id(db, user_id)
        data = user_data.model_dump(exclude_unset=True)

        if "username" in data:
            username = data["username"].strip()
            existing_user = get_user_by_name(db, username)
            if existing_user and existing_user.user_id != user.user_id:
                raise ConflictError("A user with this username already exists.")
            user.name = username
        if "email" in data:
            email = str(data["email"]).strip().lower()
            existing_email = get_user_by_email(db, email)
            if existing_email and existing_email.user_id != user.user_id:
                raise ConflictError("A user with this email already exists.")
            user.email = email
        if "is_admin" in data:
            user.is_admin = data["is_admin"]
        if "is_active" in data:
            user.is_active = data["is_active"]

        user.updated_by = current_user.user_id
        db.commit()
        db.refresh(user)
        return user
    except NotFoundError:
        raise
    except ConflictError:
        raise
    except IntegrityError as e:
        db.rollback()
        logger.error(f"User update conflict: {e}")
        raise ConflictError("A user with this username or email already exists.")
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating user: {e}")
        raise DatabaseError("An error occurred while updating a user.")
