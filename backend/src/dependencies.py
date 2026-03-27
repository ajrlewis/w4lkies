from dataclasses import dataclass
from typing import Annotated

from fastapi import Depends, Query, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from jwt.exceptions import InvalidTokenError

from config import settings
from cruds import user_crud
from database import SessionLocal
from models import User
from schemas.pagination_schema import PaginationParamsSchema
from schemas.token_schema import TokenData


async def get_pagination_params(
    page: int = Query(1, description="Page number"),
    page_size: int = Query(20, description="Number of items per page"),
) -> PaginationParamsSchema:
    return PaginationParamsSchema(page=page, page_size=page_size)


GetPaginationParamsDep = Annotated[
    PaginationParamsSchema, Depends(get_pagination_params)
]


async def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


GetDBDep = Annotated[SessionLocal, Depends(get_db)]


@dataclass
class OAuth2FormData:
    username: str
    password: str


async def get_oauth2_form_data(request: Request) -> OAuth2FormData:
    form = await request.form()
    username = form.get("username")
    password = form.get("password")
    if not isinstance(username, str) or not isinstance(password, str):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="username and password are required",
        )
    return OAuth2FormData(username=username, password=password)


OAuth2FormDataDep = Annotated[OAuth2FormData, Depends(get_oauth2_form_data)]


scopes = {"admin": "Admin User", "user": "Normal User", "customer": "Customer User"}
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token", scopes=scopes)
GetTokenDep = Annotated[str, Depends(oauth2_scheme)]


async def get_current_user(db: GetDBDep, token: GetTokenDep):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        username = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except InvalidTokenError:
        raise credentials_exception
    user = user_crud.get_user_by_name(db, token_data.username)
    if user is None:
        raise credentials_exception
    return user


GetCurrentUserDep = Annotated[User, Depends(get_current_user)]


async def get_current_active_user(current_user: GetCurrentUserDep):
    if current_user.is_active:
        return current_user
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )


GetCurrentActiveUserDep = Annotated[User, Depends(get_current_active_user)]


async def get_current_admin_user(current_user: GetCurrentActiveUserDep):
    if current_user.is_admin:
        return current_user
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions"
        )


GetCurrentAdminUserDep = Annotated[User, Depends(get_current_admin_user)]
