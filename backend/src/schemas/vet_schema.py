from typing import List, Optional, Union
from datetime import datetime

from pydantic import BaseModel


class VetBaseSchema(BaseModel):
    name: str
    address: str
    phone: str


class VetCreateSchema(VetBaseSchema):
    pass


class VetUpdateSchema(BaseModel):
    name: Union[str, None] = None
    address: Union[str, None] = None
    phone: Union[str, None] = None


class VetSchema(VetBaseSchema):
    vet_id: int

    class Config:
        from_attributes = True
