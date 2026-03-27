from datetime import date, datetime, timedelta
from typing import Optional

from fastapi import Response
from loguru import logger
from sqlalchemy import distinct, func, and_
from sqlalchemy.exc import SQLAlchemyError

from database import SessionLocal
from exceptions import NotFoundError, DatabaseError
from models import User, Booking, Customer
from schemas.customer_schema import CustomerUpdateSchema, CustomerCreateSchema
from schemas.pagination_schema import PaginationParamsSchema
from pagination import paginate


# def get_customers(db: SessionLocal, is_active: Optional[bool] = None) -> list[Customer]:
#     query = db.query(Customer)
#     if is_active is not None:
#         query = query.filter_by(is_active=is_active)
#     query = query.order_by(Customer.name)
#     customers = query.all()
#     return customers


def get_customers(
    db: SessionLocal,
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    pagination_params: Optional[PaginationParamsSchema] = None,
    response: Optional[Response] = None,
) -> list[Customer]:
    date_min = date.today() - timedelta(days=28 * 2)
    booking_count = func.count(Booking.booking_id).label("booking_count")

    # Base query with join and booking date filter
    query = (
        db.query(Customer)
        .outerjoin(
            Booking,
            and_(
                Booking.customer_id == Customer.customer_id,
                Booking.date >= date_min,
            ),
        )
        .group_by(Customer.customer_id)
        .order_by(booking_count.desc(), Customer.name.asc())
    )

    # Apply is_active filter if provided
    if is_active is not None:
        query = query.filter(Customer.is_active == is_active)

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            (Customer.name.ilike(search_term))
            | (Customer.email.ilike(search_term))
            | (Customer.phone.ilike(search_term))
            | (Customer.emergency_contact_name.ilike(search_term))
            | (Customer.emergency_contact_phone.ilike(search_term))
        )

    if pagination_params and response:
        return paginate(query, pagination_params, response)

    customers = query.all()
    return customers


def get_customer_by_id(db: SessionLocal, customer_id: int) -> Customer:
    customer = db.get(Customer, customer_id)
    logger.debug(f"{customer = }")
    logger.debug(f"{customer.email = }")
    if not customer:
        raise NotFoundError(f"Customer {customer_id} not found")
    return customer


def update_customer_by_id(
    db: SessionLocal,
    current_user: User,
    customer_id: int,
    customer_data: CustomerUpdateSchema,
) -> Customer:
    try:
        logger.debug(f"{current_user = } {customer_data = }")
        customer = get_customer_by_id(db, customer_id)
        data = customer_data.model_dump(exclude_unset=True)

        if "name" in data:
            customer.name = data["name"]
        if "phone" in data:
            customer.phone = data["phone"]
        if "email" in data:
            customer.email = data["email"]
        if "emergency_contact_name" in data:
            customer.emergency_contact_name = data["emergency_contact_name"]
        if "emergency_contact_phone" in data:
            customer.emergency_contact_phone = data["emergency_contact_phone"]
        if "is_active" in data:
            customer.is_active = data["is_active"]

        customer.updated_by = current_user.user_id
        db.commit()
        db.refresh(customer)
        return customer
    except SQLAlchemyError as e:
        detail = f"Error updating customer: {e}"
        logger.error(detail)
        db.rollback()
        raise DatabaseError("An error occurred while updating the customer.")


def add_customer(
    db: SessionLocal, current_user: User, customer_data: CustomerCreateSchema
) -> Customer:
    logger.debug(f"{customer_data = }")
    customer = Customer(
        name=customer_data.name,
        phone=customer_data.phone,
        email=customer_data.email,
        emergency_contact_name=customer_data.emergency_contact_name,
        emergency_contact_phone=customer_data.emergency_contact_phone,
        is_active=customer_data.is_active,
        signed_up_on=datetime.utcnow(),
    )
    try:
        customer.created_by = current_user.user_id
        customer.updated_by = current_user.user_id
        db.add(customer)
        db.commit()
        return customer
    except SQLAlchemyError as e:
        detail = f"Error adding customer: {e}"
        logger.error(detail)
        db.rollback()
        raise DatabaseError("An error occurred while adding a customer.")


def delete_customer_by_id(db: SessionLocal, customer_id: int):
    customer = get_customer_by_id(db, customer_id)
    if not customer:
        raise NotFoundError(f"customer {customer_id} not found")
    try:
        db.delete(customer)
        db.commit()
    except Exception as e:
        raise DatabaseError("An error occurred while deleting the customer.")
