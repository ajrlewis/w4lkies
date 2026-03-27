from typing import List, Optional, Union
from datetime import datetime

from pydantic import BaseModel

from schemas.invoice_schema import InvoiceBaseSchema
from schemas.expense_schema import ExpenseBaseSchema


class IncomeStatementBaseSchema(BaseModel):
    date_start: datetime
    date_end: datetime
    price_subtotal: float
    price_discount: float
    price_total: float
    invoices: list[InvoiceBaseSchema]
    number_of_invoices: int
    price_total_invoices: float
    price_average_invoices: float
    expenses: list[ExpenseBaseSchema]
    number_of_expenses: int
    price_total_expenses: float
    price_average_expenses: float
    profit_gross: float
    profit_margin: float


class IncomeStatementSchema(IncomeStatementBaseSchema):
    pass


class IncomeStatementUpdateSchema(BaseModel):
    name: Union[str, None] = None
    price: Union[float, None] = None
    description: Union[str, None] = None
    duration: Union[float, None] = None
    is_publicly_offered: Union[bool, None] = None
    is_active: Union[bool, None] = None


class IncomeStatementSchema(IncomeStatementBaseSchema):
    service_id: int

    class Config:
        from_attributes = True
