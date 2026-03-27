from typing import Optional

from fastapi import APIRouter, HTTPException, Query, Response, status
from loguru import logger

from cruds import dog_crud
from dependencies import GetDBDep, GetCurrentAdminUserDep
from exceptions import DatabaseError, NotFoundError
from schemas.pagination_schema import PaginationParamsSchema
from schemas.dog_schema import DogSchema, DogUpdateSchema, DogCreateSchema

dog_router = APIRouter(prefix="/dogs", tags=["Dogs"])


@dog_router.get("/breeds", response_model=list[str])
async def read_dog_breeds(db: GetDBDep) -> list[str]:
    """Reads and returns all dog breeds from the database."""
    try:
        dogs = dog_crud.get_dog_breeds(db)
        return dogs
    except DatabaseError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@dog_router.get("/", response_model=list[DogSchema])
async def read_dogs(
    db: GetDBDep,
    response: Response,
    search: Optional[str] = Query(
        None,
        description="Optional search term for dog/customer/vet fields.",
    ),
    page: Optional[int] = Query(
        None, ge=1, description="Optional page number. If omitted, returns full list."
    ),
    page_size: Optional[int] = Query(
        None, ge=1, description="Optional page size. Used when page pagination is enabled."
    ),
) -> list[DogSchema]:
    """Reads and returns all dogs from the database."""
    try:
        pagination_params = None
        if page is not None or page_size is not None:
            pagination_params = PaginationParamsSchema(
                page=page or 1, page_size=page_size or 20
            )

        dogs = dog_crud.get_dogs(
            db,
            search=search,
            pagination_params=pagination_params,
            response=response,
        )
        return dogs
    except DatabaseError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@dog_router.put("/{dog_id}", response_model=DogSchema)
async def update_dog(
    db: GetDBDep,
    current_user: GetCurrentAdminUserDep,
    dog_id: int,
    dog_data: DogUpdateSchema,
) -> DogSchema:
    """Updates the properties of a specific dog in the database."""
    logger.debug(f"{dog_data = }")
    try:
        dog = dog_crud.update_dog_by_id(db, current_user, dog_id, dog_data)
        return dog
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except DatabaseError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}",
        )


@dog_router.delete("/{dog_id}")
async def delete_dog(db: GetDBDep, current_user: GetCurrentAdminUserDep, dog_id: int):
    """Deletes a specific dog in the database."""
    try:
        dog = dog_crud.delete_dog_by_id(db, dog_id)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except DatabaseError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}",
        )


@dog_router.post("/", response_model=DogSchema)
async def create_dog(
    db: GetDBDep, current_user: GetCurrentAdminUserDep, dog_data: DogCreateSchema
) -> DogSchema:
    """Creates a dog to add to the database."""
    try:
        dog = dog_crud.add_dog(db, current_user, dog_data)
        return dog
    except DatabaseError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}",
        )


@dog_router.get("/images")
async def read_dog_images(db: GetDBDep):
    """Reads and returns all dog images from the database."""
    try:
        dogs = dog_crud.get_dogs(db)
        return dogs
    except DatabaseError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
