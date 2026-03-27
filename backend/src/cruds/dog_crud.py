from typing import Optional

from fastapi import Response
from loguru import logger
from sqlalchemy import distinct
from sqlalchemy.exc import SQLAlchemyError

from database import SessionLocal
from exceptions import NotFoundError, DatabaseError
from pagination import paginate
from models import User, Customer, Dog, Vet
from schemas.pagination_schema import PaginationParamsSchema
from schemas.dog_schema import DogUpdateSchema, DogCreateSchema


def get_dogs(
    db: SessionLocal,
    search: Optional[str] = None,
    pagination_params: Optional[PaginationParamsSchema] = None,
    response: Optional[Response] = None,
) -> list[Dog]:
    query = db.query(Dog).join(Customer, Dog.customer_id == Customer.customer_id).join(
        Vet, Dog.vet_id == Vet.vet_id
    )

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            (Dog.name.ilike(search_term))
            | (Dog.breed.ilike(search_term))
            | (Dog.medical_needs.ilike(search_term))
            | (Dog.behavioral_issues.ilike(search_term))
            | (Customer.name.ilike(search_term))
            | (Vet.name.ilike(search_term))
        )

    query = query.order_by(Dog.name.asc())

    if pagination_params and response:
        return paginate(query, pagination_params, response)

    dogs = query.all()
    return dogs


def get_dog_breeds(db: SessionLocal) -> list[str]:
    query = db.query(distinct(Dog.breed))
    query = query.order_by(Dog.breed)
    results = query.all()
    logger.debug(f"{results = }")
    dog_breeds = [result[0] for result in results]
    logger.debug(f"{dog_breeds = }")
    return dog_breeds


def get_dog_by_id(db: SessionLocal, dog_id: int) -> Dog:
    dog = db.get(Dog, dog_id)
    if not dog:
        raise NotFoundError(f"Dog {dog_id} not found")
    return dog


def update_dog_by_id(
    db: SessionLocal, current_user: User, dog_id: int, dog_data: DogUpdateSchema
) -> Dog:
    try:
        logger.debug(f"{current_user = } {dog_data = }")
        dog = get_dog_by_id(db, dog_id)
        data = dog_data.model_dump(exclude_unset=True)

        if "name" in data:
            dog.name = data["name"]
        if "date_of_birth" in data:
            dog.date_of_birth = data["date_of_birth"]
        if "is_allowed_treats" in data:
            dog.is_allowed_treats = data["is_allowed_treats"]
        if "is_allowed_off_the_lead" in data:
            dog.is_allowed_off_the_lead = data["is_allowed_off_the_lead"]
        if "is_allowed_on_social_media" in data:
            dog.is_allowed_on_social_media = data["is_allowed_on_social_media"]
        if "is_neutered_or_spayed" in data:
            dog.is_neutered_or_spayed = data["is_neutered_or_spayed"]
        if "behavioral_issues" in data:
            dog.behavioral_issues = data["behavioral_issues"]
        if "medical_needs" in data:
            dog.medical_needs = data["medical_needs"]
        if "breed" in data:
            dog.breed = data["breed"]
        if "customer_id" in data:
            dog.customer_id = data["customer_id"]
        if "vet_id" in data:
            dog.vet_id = data["vet_id"]

        dog.updated_by = current_user.user_id
        db.commit()
        db.refresh(dog)
        return dog
    except SQLAlchemyError as e:
        detail = f"Error updating dog: {e}"
        logger.error(detail)
        db.rollback()
        raise DatabaseError("An error occurred while updating the dog.")


def add_dog(db: SessionLocal, current_user: User, dog_data: DogCreateSchema) -> Dog:
    logger.debug(f"{dog_data = }")
    dog = Dog(
        name=dog_data.name,
        date_of_birth=dog_data.date_of_birth,
        is_allowed_treats=dog_data.is_allowed_treats,
        is_allowed_off_the_lead=dog_data.is_allowed_off_the_lead,
        is_allowed_on_social_media=dog_data.is_allowed_on_social_media,
        is_neutered_or_spayed=dog_data.is_neutered_or_spayed,
        behavioral_issues=dog_data.behavioral_issues,
        medical_needs=dog_data.medical_needs,
        breed=dog_data.breed,
        customer_id=dog_data.customer_id,
        vet_id=dog_data.vet_id,
    )
    try:
        dog.created_by = current_user.user_id
        dog.updated_by = current_user.user_id
        db.add(dog)
        db.commit()
        db.refresh(dog)
        return dog
    except SQLAlchemyError as e:
        detail = f"Error adding dog: {e}"
        logger.error(detail)
        db.rollback()
        raise DatabaseError("An error occurred while adding a dog.")


def delete_dog_by_id(db: SessionLocal, dog_id: int):
    dog = get_dog_by_id(db, dog_id)
    if not dog:
        raise NotFoundError(f"Dog {dog_id} not found")
    try:
        db.delete(dog)
        db.commit()
    except Exception as e:
        raise DatabaseError("An error occurred while deleting the dog.")
