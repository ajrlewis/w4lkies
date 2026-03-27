from typing import Union

from pydantic import BaseModel


class Token(BaseModel):
    access_token: str
    token_type: str
    scopes: list[str]  # or roles if you prefer


class TokenData(BaseModel):
    username: Union[str, None] = None
    scopes: list[str] = []
