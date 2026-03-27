from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr


class CustomerSnippetSchema(BaseModel):
    customer_id: int
    name: str


class CustomerBaseSchema(BaseModel):
    name: str
    phone: str
    email: str
    emergency_contact_name: str
    emergency_contact_phone: str


class CustomerCreateSchema(CustomerBaseSchema):
    signed_up_on: datetime
    is_active: bool = True


class CustomerUpdateSchema(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    is_active: Optional[bool] = None


class CustomerSchema(CustomerBaseSchema):
    customer_id: int
    signed_up_on: datetime
    is_active: bool = True

    class Config:
        from_attributes = True
