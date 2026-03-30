from typing import Optional

from pydantic import BaseModel, Field, model_validator


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


class UserChangePasswordSchema(BaseModel):
    current_password: str = Field(min_length=6, max_length=128)
    new_password: str = Field(min_length=6, max_length=128)

    @model_validator(mode="after")
    def validate_new_password_differs(self):
        if self.current_password == self.new_password:
            raise ValueError("New password must be different from the current password.")
        return self


class UserResetPasswordSchema(BaseModel):
    new_password: str = Field(min_length=6, max_length=128)


class UserSchema(UserBaseSchema):
    user_id: int
    is_admin: bool
    is_active: bool

    class Config:
        from_attributes = True
