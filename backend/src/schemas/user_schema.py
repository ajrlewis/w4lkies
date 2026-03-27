from typing import Optional

from pydantic import BaseModel, Field


class UserSnippetSchema(BaseModel):
    user_id: int
    username: str


class UserBaseSchema(BaseModel):
    username: str = Field(min_length=2, max_length=100)
    email: str = Field(min_length=3, max_length=255)


class UserCreateSchema(UserBaseSchema):
    password: str = Field(min_length=6, max_length=128)
    is_admin: bool = False
    is_active: bool = True


class UserUpdateSchema(BaseModel):
    username: Optional[str] = Field(default=None, min_length=2, max_length=100)
    email: Optional[str] = Field(default=None, min_length=3, max_length=255)
    is_admin: Optional[bool] = None
    is_active: Optional[bool] = None


class UserSchema(UserBaseSchema):
    user_id: int
    is_admin: bool
    is_active: bool

    class Config:
        from_attributes = True
