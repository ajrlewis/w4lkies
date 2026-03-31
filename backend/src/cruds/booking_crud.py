from datetime import datetime, timedelta, time
from typing import Optional

from fastapi import Response
from loguru import logger
from sqlalchemy import or_

from database import SessionLocal
from exceptions import NotFoundError, DatabaseError
from models import Booking, Customer, Service, User
from pagination import paginate
from schemas.booking_schema import BookingCreateSchema, BookingUpdateSchema
from schemas.pagination_schema import PaginationParamsSchema


def get_booking_time_choices(
    db: SessionLocal,
    start_hour: int = 8,
    end_hour: int = 18,
    interval_minutes: int = 15,
) -> list:
    working_hours_start = time(start_hour, 0)
    working_hours_end = time(end_hour, 0)
    time_interval = timedelta(minutes=interval_minutes)
    time_choices = []
    current_time = datetime.combine(datetime.today(), working_hours_start)
    end_time = datetime.combine(datetime.today(), working_hours_end)
    while current_time <= end_time:
        time_choice = (
            current_time.strftime("%H:%M:%S"),
            current_time.strftime("%I:%M %p"),
        )
        time_choices.append(time_choice)
        current_time += time_interval
    logger.debug(f"{time_choices = }")
    return time_choices


def get_booking_filter_options(
    db: SessionLocal, view_mode: str = "upcoming", user_id: Optional[int] = None
) -> dict:
    date_min = None
    date_max = None
    today = datetime.now().date()

    if view_mode == "history":
        date_max = today
    else:
        date_min = today

    users_query = db.query(User.user_id, User.name).join(
        Booking, Booking.user_id == User.user_id
    )
    customers_query = db.query(Customer.customer_id, Customer.name).join(
        Booking, Booking.customer_id == Customer.customer_id
    )

    if date_min:
        users_query = users_query.filter(Booking.date >= date_min)
        customers_query = customers_query.filter(Booking.date >= date_min)
    if date_max:
        users_query = users_query.filter(Booking.date < date_max)
        customers_query = customers_query.filter(Booking.date < date_max)
    if user_id:
        users_query = users_query.filter(Booking.user_id == user_id)
        customers_query = customers_query.filter(Booking.user_id == user_id)

    users = [
        {"user_id": user_id, "username": username}
        for user_id, username in users_query.distinct().order_by(User.name.asc()).all()
    ]
    customers = [
        {"customer_id": customer_id, "name": name}
        for customer_id, name in customers_query.distinct()
        .order_by(Customer.name.asc())
        .all()
    ]

    return {"users": users, "customers": customers}


def get_bookings(
    db: SessionLocal,
    pagination_params: Optional[PaginationParamsSchema] = None,
    response: Optional[Response] = None,
    user_id: Optional[int] = None,
    customer_id: Optional[int] = None,
    search: Optional[str] = None,
    date_min: Optional[str] = None,
    date_max: Optional[str] = None,
    date_max_inclusive: bool = False,
    order_by: Optional[tuple] = (Booking.date.desc(), Booking.time.asc()),
) -> dict:
    query = db.query(Booking)
    if user_id and int(user_id) > -1:
        query = query.filter(Booking.user_id == user_id)
    if customer_id and int(customer_id) > -1:
        query = query.filter(Booking.customer_id == customer_id)
    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Booking.customer.has(Customer.name.ilike(search_term)),
                Booking.service.has(Service.name.ilike(search_term)),
                Booking.user.has(User.name.ilike(search_term)),
            )
        )
    if date_min:
        query = query.filter(Booking.date >= date_min)
    if date_max:
        if date_max_inclusive:
            query = query.filter(Booking.date <= date_max)
        else:
            query = query.filter(Booking.date < date_max)
    if order_by:
        query = query.order_by(*order_by)
    if pagination_params is not None and response is not None:
        results = paginate(query, pagination_params, response)
    else:
        results = query.all()
    return results


def get_upcoming_bookings(
    db: SessionLocal,
    pagination_params: PaginationParamsSchema,
    response: Response,
    user_id: Optional[int] = None,
    customer_id: Optional[int] = None,
    search: Optional[str] = None,
) -> dict:
    results = get_bookings(
        db=db,
        response=response,
        user_id=user_id,
        customer_id=customer_id,
        search=search,
        date_min=datetime.now().date(),
        order_by=(Booking.date.asc(), Booking.time.asc()),
        pagination_params=pagination_params,
    )
    return results


def get_historic_bookings(
    db: SessionLocal,
    pagination_params: PaginationParamsSchema,
    response: Response,
    user_id: Optional[int] = None,
    customer_id: Optional[int] = None,
    search: Optional[str] = None,
) -> tuple[list[Booking], int]:
    results = get_bookings(
        db=db,
        user_id=user_id,
        customer_id=customer_id,
        search=search,
        date_max=datetime.now().date(),
        order_by=(Booking.date.desc(), Booking.time.asc()),
        pagination_params=pagination_params,
        response=response,
    )
    return results


def get_booking_by_id(db: SessionLocal, booking_id: int) -> Booking:
    booking = db.get(Booking, booking_id)
    logger.debug(f"{booking = }")
    if not booking:
        raise NotFoundError(f"Booking {booking_id} not found")
    return booking


def update_booking_by_id(
    db: SessionLocal,
    current_user: User,
    booking_id: int,
    booking_data: BookingUpdateSchema,
) -> Booking:
    logger.debug(f"{current_user = } {booking_data = }")
    booking = get_booking_by_id(db, booking_id)
    if not booking:
        raise NotFoundError(f"Booking {booking_id} not found")
    data = booking_data.model_dump(exclude_unset=True)

    if "date" in data:
        booking.date = data["date"]
    if "time" in data:
        booking.time = data["time"]
    if "customer_id" in data:
        booking.customer_id = data["customer_id"]
    if "service_id" in data:
        booking.service_id = data["service_id"]
    if "user_id" in data:
        booking.user_id = data["user_id"]

    try:
        booking.updated_by = current_user.user_id
        db.commit()
        db.refresh(booking)
        return booking
    except Exception as e:
        detail = f"Error updating booking: {e}"
        logger.error(detail)
        db.rollback()
        raise DatabaseError("An error occurred while updating the booking.")


def add_booking(
    db: SessionLocal, current_user: User, booking_data: BookingCreateSchema
) -> Booking:
    logger.debug(f"{booking_data = }")
    booking = Booking(
        date=booking_data.date,
        time=booking_data.time,
        customer_id=booking_data.customer_id,
        service_id=booking_data.service_id,
        user_id=booking_data.user_id,
    )
    try:
        booking.created_by = current_user.user_id
        booking.updated_by = current_user.user_id
        db.add(booking)
        db.commit()
        return booking
    except Exception as e:
        detail = f"Error adding booking: {e}"
        logger.error(detail)
        db.rollback()
        raise DatabaseError("An error occurred while adding booking.")


def delete_booking_by_id(db: SessionLocal, booking_id: int):
    booking = get_booking_by_id(db, booking_id)
    if not booking:
        raise NotFoundError(f"Booking {booking_id} not found")
    try:
        db.delete(booking)
        db.commit()
    except Exception as e:
        raise DatabaseError("An error occurred while deleting the booking.")
