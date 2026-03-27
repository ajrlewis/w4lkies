from datetime import datetime, timedelta
import hashlib
from typing import Optional

from fastapi import Response
from loguru import logger
from sqlalchemy import desc, or_
from sqlalchemy.exc import SQLAlchemyError

from cruds import booking_crud
from database import SessionLocal
from exceptions import NotFoundError, DatabaseError
from models import Customer, Invoice, User
from pagination import paginate
from schemas.pagination_schema import PaginationParamsSchema
from services import invoice_download_service


def get_invoices(
    db: SessionLocal,
    is_paid: Optional[bool] = None,
    search: Optional[str] = None,
    date_min: Optional[str] = None,
    date_max: Optional[str] = None,
    pagination_params: Optional[PaginationParamsSchema] = None,
    response: Optional[Response] = None,
) -> list[Invoice]:
    query = db.query(Invoice).outerjoin(
        Customer, Invoice.customer_id == Customer.customer_id
    )

    if is_paid is not None:
        query = (
            query.filter(Invoice.date_paid.isnot(None))
            if is_paid
            else query.filter(Invoice.date_paid.is_(None))
        )

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(Invoice.reference.ilike(search_term), Customer.name.ilike(search_term))
        )

    if date_min:
        logger.debug(f"{date_min = }")
        query = query.filter(Invoice.date_issued >= date_min)
    if date_max:
        logger.debug(f"{date_max = }")
        query = query.filter(Invoice.date_issued <= date_max)

    query = query.order_by(desc(Invoice.date_issued), desc(Invoice.invoice_id))

    if pagination_params and response:
        return paginate(query, pagination_params, response)

    return query.all()


def get_invoice_by_id(db: SessionLocal, invoice_id: int) -> Invoice:
    invoice = db.get(Invoice, invoice_id)
    if not invoice:
        raise NotFoundError(f"Invoice {invoice_id} not found")
    return invoice


def download_invoice_by_id(db: SessionLocal, invoice_id: int):
    invoice = get_invoice_by_id(db, invoice_id)

    try:
        pdf_file, pdf_filepath = invoice_download_service.create(invoice)
        logger.debug(f"Created {pdf_filepath}, {type(pdf_file)}")
        return pdf_file, pdf_filepath
    except Exception as e:
        detail = f"An error occurred downloading invoice {invoice_id}: {e}"
        logger.error(detail)
        raise DatabaseError(detail)


def mark_invoice_paid_by_id(
    db: SessionLocal, current_user: User, invoice_id: int
) -> Invoice:
    invoice = db.get(Invoice, invoice_id)
    if not invoice:
        raise NotFoundError(f"Invoice {invoice_id} not found")
    try:
        invoice.date_paid = datetime.utcnow()
        invoice.updated_by = current_user.user_id
        db.commit()
        return invoice
    except SQLAlchemyError as e:
        detail = f"Error updating invoice date paid: {e}"
        logger.error(detail)
        db.rollback()
        raise DatabaseError("An error occurred while updating the invoice date paid.")


def delete_invoice_by_id(db: SessionLocal, invoice_id: int) -> None:
    invoice = get_invoice_by_id(db, invoice_id)
    try:
        db.delete(invoice)
        db.commit()
    except SQLAlchemyError as e:
        detail = f"Error deleting invoice: {e}"
        logger.error(detail)
        db.rollback()
        raise DatabaseError("An error occurred while deleting the invoice.")


def add_invoice(db: SessionLocal, current_user: User, invoice_data: dict) -> Invoice:
    logger.debug(f"{invoice_data = }")
    invoice = Invoice(
        customer_id=invoice_data.get("customer_id"),
        date_start=invoice_data.get("date_start"),
        date_end=invoice_data.get("date_end"),
        date_issued=invoice_data.get("date_issued"),
        date_due=invoice_data.get("date_due"),
        date_paid=invoice_data.get("date_paid"),
        price_subtotal=invoice_data.get("price_subtotal"),
        price_discount=invoice_data.get("price_discount"),
        price_total=invoice_data.get("price_total"),
        reference=invoice_data.get("reference"),
        bookings=invoice_data.get("bookings", []),
    )
    try:
        invoice.created_by = current_user.user_id
        invoice.updated_by = current_user.user_id
        db.add(invoice)
        db.commit()
        return invoice
    except SQLAlchemyError as e:
        detail = f"Error adding invoice: {e}"
        logger.error(detail)
        db.rollback()
        raise DatabaseError("An error occurred while adding an invoice.")


def generate_invoice_data(
    db: SessionLocal, customer_id: int, date_start: str, date_end: str
) -> dict:
    reference_prefix = "W4LKIES"
    days_due = 7

    # Get unique reference for invoice
    reference_hash = (
        hashlib.sha256(f"{customer_id}-{date_start}-{date_end}".encode("UTF-8"))
        .hexdigest()[:8]
        .upper()
    )
    reference = f"{reference_prefix}-{reference_hash}"

    # Get the customer bookings.
    bookings = booking_crud.get_bookings(
        db=db,
        pagination_params=None,
        response=None,
        date_min=date_start,
        date_max=date_end,
        customer_id=customer_id,
    )

    # Get the total price of the bookings
    price_subtotal = 0.0
    price_discount = 0.0
    for booking in bookings:
        price_subtotal += booking.service.price
    price_total = price_subtotal - price_discount
    logger.debug(f"{price_discount = } {price_total = }")

    invoice_data = {
        "reference": reference,
        "date_start": date_start,
        "date_end": date_end,
        "date_issued": datetime.now(),
        "date_due": datetime.now() + timedelta(days=days_due),
        "price_subtotal": price_subtotal,
        "price_discount": price_discount,
        "price_total": price_total,
        "customer_id": customer_id,
        "bookings": bookings,
    }

    return invoice_data


def generate_invoice(
    db: SessionLocal,
    current_user: User,
    customer_id: int,
    date_start: datetime,
    date_end: datetime,
) -> Optional[Invoice]:
    new_invoice_data = generate_invoice_data(db, customer_id, date_start, date_end)
    logger.debug(f"{new_invoice_data = }")
    new_invoice = add_invoice(db, current_user, new_invoice_data)
    logger.info(f"{new_invoice = }")
    logger.info(f"{new_invoice.bookings = }")
    return new_invoice
