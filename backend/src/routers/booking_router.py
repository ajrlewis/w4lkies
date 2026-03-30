from typing import Literal, Optional

from fastapi import APIRouter, HTTPException, Query, Response, status
from loguru import logger

from cruds import booking_crud
from dependencies import (
    GetDBDep,
    GetCurrentUserDep,
    GetCurrentAdminUserDep,
    GetPaginationParamsDep,
)
from exceptions import DatabaseError, NotFoundError
from schemas.booking_schema import (
    BookingFilterOptionsSchema,
    BookingSnippetSchema,
    BookingSchema,
    BookingUpdateSchema,
    BookingCreateSchema,
)

booking_router = APIRouter(prefix="/bookings", tags=["Bookings"])


@booking_router.get("/time_choices", response_model=list[tuple[str, str]])
async def read_booking_time_choices(db: GetDBDep) -> list[tuple[str, str]]:
    """Returns all available booking times."""
    try:
        time_choices = booking_crud.get_booking_time_choices(db)
        return time_choices
    except DatabaseError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@booking_router.get("/filter_options", response_model=BookingFilterOptionsSchema)
async def read_booking_filter_options(
    db: GetDBDep,
    current_user: GetCurrentUserDep,
    view: Literal["upcoming", "history"] = Query(
        "upcoming", description="Which booking set to source filter options from."
    ),
) -> BookingFilterOptionsSchema:
    """Returns users/customers that actually have bookings in the selected view."""
    try:
        options = booking_crud.get_booking_filter_options(
            db,
            view_mode=view,
            user_id=None if current_user.is_admin else current_user.user_id,
        )
        return options
    except DatabaseError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@booking_router.get("/upcoming", response_model=list[BookingSnippetSchema])
async def read_upcoming_bookings(
    db: GetDBDep,
    current_user: GetCurrentUserDep,
    pagination_params: GetPaginationParamsDep,
    response: Response,
    user_id: Optional[int] = Query(
        None, description="Filter upcoming bookings by user. Defaults to None."
    ),
    customer_id: Optional[int] = Query(
        None, description="Filter upcoming bookings by customer. Defaults to None."
    ),
    search: Optional[str] = Query(
        None, description="Search by customer, service, or walker."
    ),
) -> list[BookingSnippetSchema]:
    """Reads and returns all upcoming bookings from the database."""
    try:
        effective_user_id = current_user.user_id if not current_user.is_admin else user_id
        bookings = booking_crud.get_upcoming_bookings(
            db,
            pagination_params=pagination_params,
            response=response,
            user_id=effective_user_id,
            customer_id=customer_id,
            search=search,
        )
        return bookings
    except DatabaseError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@booking_router.get("/history", response_model=list[BookingSnippetSchema])
async def read_historic_bookings(
    db: GetDBDep,
    current_user: GetCurrentUserDep,
    pagination_params: GetPaginationParamsDep,
    response: Response,
    user_id: Optional[int] = Query(
        None, description="Filter upcoming bookings by user. Defaults to None."
    ),
    customer_id: Optional[int] = Query(
        None, description="Filter upcoming bookings by customer. Defaults to None."
    ),
    search: Optional[str] = Query(
        None, description="Search by customer, service, or walker."
    ),
) -> list[BookingSnippetSchema]:
    """Reads and returns all historic bookings from the database."""
    try:
        effective_user_id = current_user.user_id if not current_user.is_admin else user_id
        bookings = booking_crud.get_historic_bookings(
            db,
            pagination_params=pagination_params,
            response=response,
            user_id=effective_user_id,
            customer_id=customer_id,
            search=search,
        )
        return bookings
    except DatabaseError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@booking_router.get("/", response_model=list[BookingSchema])
async def read_bookings(
    db: GetDBDep,
    current_user: GetCurrentUserDep,
    pagination_params: GetPaginationParamsDep,
    response: Response,
) -> list[BookingSchema]:
    """Reads and returns all bookings from the database."""
    try:
        if current_user.is_admin:
            bookings = booking_crud.get_bookings(
                db, pagination_params=pagination_params, response=response
            )
        else:
            bookings = booking_crud.get_bookings(
                db,
                pagination_params=pagination_params,
                response=response,
                user_id=current_user.user_id,
            )
        return bookings
    except DatabaseError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@booking_router.get("/{booking_id}", response_model=BookingSchema)
async def read_booking(
    db: GetDBDep, current_user: GetCurrentUserDep, booking_id: int
) -> BookingSchema:
    """Reads and returns a specific booking from the database."""
    try:
        booking = booking_crud.get_booking_by_id(db, booking_id)
        if not current_user.is_admin and booking.user_id != current_user.user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return booking
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except DatabaseError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@booking_router.put("/{booking_id}", response_model=BookingSchema)
async def update_booking(
    db: GetDBDep,
    current_user: GetCurrentAdminUserDep,
    booking_id: int,
    booking_data: BookingUpdateSchema,
) -> BookingSchema:
    """Updates the properties of a specific booking in the database."""
    logger.debug(f"{booking_data = }")
    try:
        booking = booking_crud.update_booking_by_id(
            db, current_user, booking_id, booking_data
        )
        return booking
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


@booking_router.delete("/{booking_id}")
async def delete_booking(
    db: GetDBDep, current_user: GetCurrentAdminUserDep, booking_id: int
):
    """Deletes a specific booking in the database."""
    try:
        booking = booking_crud.delete_booking_by_id(db, booking_id)
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


@booking_router.post("/", response_model=BookingSnippetSchema)
async def create_booking(
    db: GetDBDep,
    current_user: GetCurrentAdminUserDep,
    booking_data: BookingCreateSchema,
) -> BookingSnippetSchema:
    """Creates a booking to add to the database."""
    try:
        booking = booking_crud.add_booking(db, current_user, booking_data)
        return booking
    except DatabaseError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}",
        )
