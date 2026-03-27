from typing import List, Optional, Union
from datetime import datetime

from pydantic import BaseModel


class ServiceSnippetSchema(BaseModel):
    service_id: int
    name: str
    price: float


class ServiceBaseSchema(BaseModel):
    name: str
    price: Union[float, None] = None
    description: str
    duration: Union[float, None] = None
    is_publicly_offered: bool
    is_active: bool


class ServiceCreateSchema(ServiceBaseSchema):
    pass


class ServiceUpdateSchema(BaseModel):
    name: Union[str, None] = None
    price: Union[float, None] = None
    description: Union[str, None] = None
    duration: Union[float, None] = None
    is_publicly_offered: Union[bool, None] = None
    is_active: Union[bool, None] = None


class ServiceSchema(ServiceBaseSchema):
    service_id: int

    class Config:
        from_attributes = True
