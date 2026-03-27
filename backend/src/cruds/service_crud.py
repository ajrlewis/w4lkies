from datetime import date, timedelta
from typing import Optional

from fastapi import Response
from loguru import logger
from sqlalchemy import and_, func
from sqlalchemy.exc import SQLAlchemyError

from database import SessionLocal
from exceptions import NotFoundError, DatabaseError
from models import User, Service, Booking
from pagination import paginate
from schemas.pagination_schema import PaginationParamsSchema
from schemas.service_schema import ServiceUpdateSchema, ServiceCreateSchema


def get_services(
    db: SessionLocal,
    is_active: Optional[bool] = None,
    is_publicly_offered: Optional[bool] = None,
    search: Optional[str] = None,
    pagination_params: Optional[PaginationParamsSchema] = None,
    response: Optional[Response] = None,
) -> list[Service]:
    one_year_ago = date.today() - timedelta(days=365)
    booking_count = func.count(Booking.booking_id).label("booking_count")

    query = (
        db.query(Service)
        .outerjoin(
            Booking,
            and_(
                Booking.service_id == Service.service_id, Booking.date >= one_year_ago
            ),
        )
        .group_by(Service.service_id)
        .order_by(booking_count.desc(), Service.name.asc())
    )

    if is_active is not None:
        query = query.filter(Service.is_active == is_active)
    if is_publicly_offered is not None:
        query = query.filter(Service.is_publicly_offered == is_publicly_offered)
    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            (Service.name.ilike(search_term)) | (Service.description.ilike(search_term))
        )

    if pagination_params and response:
        return paginate(query, pagination_params, response)

    services = query.all()
    return services


def get_service_by_id(db: SessionLocal, service_id: int) -> Service:
    service = db.get(Service, service_id)
    if not service:
        raise NotFoundError(f"Service {service_id} not found")
    return service


def update_service_by_id(
    db: SessionLocal,
    current_user: User,
    service_id: int,
    service_data: ServiceUpdateSchema,
) -> Service:
    try:
        logger.debug(f"{current_user = } {service_data = }")
        service = get_service_by_id(db, service_id)
        data = service_data.model_dump(exclude_unset=True)

        if "name" in data:
            service.name = data["name"]
        if "price" in data:
            service.price = data["price"]
        if "description" in data:
            service.description = data["description"]
        if "duration" in data:
            service.duration = data["duration"]
        if "is_publicly_offered" in data:
            service.is_publicly_offered = data["is_publicly_offered"]
        if "is_active" in data:
            service.is_active = data["is_active"]

        service.updated_by = current_user.user_id
        db.commit()
        db.refresh(service)
        return service
    except SQLAlchemyError as e:
        detail = f"Error updating service: {e}"
        logger.error(detail)
        db.rollback()
        raise DatabaseError("An error occurred while updating the service.")


def add_service(
    db: SessionLocal, current_user: User, service_data: ServiceCreateSchema
) -> Service:
    logger.debug(f"{service_data = }")
    service = Service(
        name=service_data.name,
        price=service_data.price,
        description=service_data.description,
        duration=service_data.duration,
        is_publicly_offered=service_data.is_publicly_offered,
        is_active=service_data.is_active,
    )
    try:
        service.created_by = current_user.user_id
        service.updated_by = current_user.user_id
        db.add(service)
        db.commit()
        db.refresh(service)
        return service
    except SQLAlchemyError as e:
        detail = f"Error adding service: {e}"
        logger.error(detail)
        db.rollback()
        raise DatabaseError("An error occurred while adding a service.")


def delete_service_by_id(db: SessionLocal, service_id: int):
    service = get_service_by_id(db, service_id)
    if not service:
        raise NotFoundError(f"Service {service_id} not found")
    try:
        db.delete(service)
        db.commit()
    except Exception:
        raise DatabaseError("An error occurred while deleting the service.")
