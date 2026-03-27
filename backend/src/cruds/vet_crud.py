from typing import Optional

from fastapi import Response
from loguru import logger
from sqlalchemy.exc import SQLAlchemyError

from database import SessionLocal
from exceptions import NotFoundError, DatabaseError
from models import User, Vet
from pagination import paginate
from schemas.pagination_schema import PaginationParamsSchema
from schemas.vet_schema import VetUpdateSchema, VetCreateSchema


def get_vets(
    db: SessionLocal,
    search: Optional[str] = None,
    pagination_params: Optional[PaginationParamsSchema] = None,
    response: Optional[Response] = None,
) -> list[Vet]:
    query = db.query(Vet)

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            (Vet.name.ilike(search_term))
            | (Vet.address.ilike(search_term))
            | (Vet.phone.ilike(search_term))
        )

    query = query.order_by(Vet.name.asc())

    if pagination_params and response:
        return paginate(query, pagination_params, response)

    vets = query.all()
    return vets


def get_vet_by_id(db: SessionLocal, vet_id: int) -> Vet:
    vet = db.get(Vet, vet_id)
    if not vet:
        raise NotFoundError(f"Vet {vet_id} not found")
    return vet


def update_vet_by_id(
    db: SessionLocal, current_user: User, vet_id: int, vet_data: VetUpdateSchema
) -> Vet:
    try:
        vet = get_vet_by_id(db, vet_id)
        data = vet_data.model_dump(exclude_unset=True)

        if "name" in data:
            vet.name = data["name"]
        if "phone" in data:
            vet.phone = data["phone"]
        if "address" in data:
            vet.address = data["address"]

        vet.updated_by = current_user.user_id
        db.commit()
        db.refresh(vet)
        return vet
    except SQLAlchemyError as e:
        detail = f"Error updating vet: {e}"
        logger.error(detail)
        db.rollback()
        raise DatabaseError("An error occurred while updating the vet.")


def add_vet(db: SessionLocal, current_user: User, vet_data: VetCreateSchema) -> Vet:
    logger.debug(f"{vet_data = }")
    vet = Vet(name=vet_data.name, address=vet_data.address, phone=vet_data.phone)
    try:
        vet.created_by = current_user.user_id
        vet.updated_by = current_user.user_id
        db.add(vet)
        db.commit()
        db.refresh(vet)
        return vet
    except SQLAlchemyError as e:
        detail = f"Error adding vet: {e}"
        logger.error(detail)
        db.rollback()
        raise DatabaseError("An error occurred while adding a vet.")


def delete_vet_by_id(db: SessionLocal, vet_id: int):
    vet = get_vet_by_id(db, vet_id)
    if not vet:
        raise NotFoundError(f"Vet {vet_id} not found")
    try:
        db.delete(vet)
        db.commit()
    except Exception as e:
        raise DatabaseError("An error occurred while deleting the vet.")
