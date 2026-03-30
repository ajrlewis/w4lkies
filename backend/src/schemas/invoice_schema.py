from typing import List, Optional, Union
from datetime import datetime

from pydantic import BaseModel

from schemas.booking_schema import BookingBaseSchema, BookingSnippetSchema
from schemas.customer_schema import (
    CustomerSchema,
    CustomerBaseSchema,
    CustomerSnippetSchema,
)


class InvoiceBaseSchema(BaseModel):
    date_start: datetime
    date_end: datetime
    date_issued: datetime
    date_due: Union[datetime, None] = None
    date_paid: Union[datetime, None] = None

    price_subtotal: float
    price_discount: float
    price_total: float

    bookings: list[BookingSnippetSchema]

    customer: Union[CustomerSnippetSchema, None] = None

    reference: str


class InvoiceSchema(InvoiceBaseSchema):
    pass


class InvoiceCreateSchema(BaseModel):
    pass


class InvoiceGenerateSchema(BaseModel):
    date_start: datetime
    date_end: datetime
    customer_id: int


class InvoiceGenerateAllSchema(BaseModel):
    date_start: datetime
    date_end: datetime


class InvoiceGenerateAllResultSchema(BaseModel):
    date_start: datetime
    date_end: datetime
    customers_with_bookings: int
    invoices_generated: int
    skipped_customers: int
    invoice_ids: list[int]


class InvoiceUpdateSchema(BaseModel):
    name: Union[str, None] = None
    price: Union[float, None] = None
    description: Union[str, None] = None
    duration: Union[float, None] = None
    is_publicly_offered: Union[bool, None] = None
    is_active: Union[bool, None] = None


class InvoiceSchema(InvoiceBaseSchema):
    invoice_id: int

    class Config:
        from_attributes = True
