from typing import List, Optional, Union
from datetime import datetime

from pydantic import BaseModel


class ExpenseBaseSchema(BaseModel):
    date: datetime
    price: float
    description: str
    category: str


class ExpenseCreateSchema(ExpenseBaseSchema):
    pass


class ExpenseUpdateSchema(BaseModel):
    date: Union[datetime, None] = None
    price: Union[float, None] = None
    description: Union[str, None] = None
    category: Union[str, None] = None


class ExpenseSchema(ExpenseBaseSchema):
    expense_id: int

    class Config:
        from_attributes = True
