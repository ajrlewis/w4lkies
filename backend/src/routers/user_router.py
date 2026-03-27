from typing import Optional

from fastapi import APIRouter, HTTPException, Query, Response, status

from cruds import user_crud
from dependencies import GetDBDep, GetCurrentUserDep, GetCurrentAdminUserDep
from exceptions import ConflictError, DatabaseError, NotFoundError
from schemas.pagination_schema import PaginationParamsSchema
from schemas.user_schema import UserCreateSchema, UserSchema, UserUpdateSchema


user_router = APIRouter(prefix="/users", tags=["Users"])


@user_router.get("/", response_model=list[UserSchema])
async def read_users(
    db: GetDBDep,
    response: Response,
    current_user: GetCurrentAdminUserDep,
    is_active: Optional[bool] = Query(
        None, description="Filter users by their active status. Defaults to None."
    ),
    search: Optional[str] = Query(
        None,
        description="Optional search term for username/email.",
    ),
    page: Optional[int] = Query(
        None, ge=1, description="Optional page number. If omitted, returns full list."
    ),
    page_size: Optional[int] = Query(
        None, ge=1, description="Optional page size. Used when page pagination is enabled."
    ),
) -> list[UserSchema]:
    """Reads and returns all users from the database."""
    try:
        pagination_params = None
        if page is not None or page_size is not None:
            pagination_params = PaginationParamsSchema(
                page=page or 1, page_size=page_size or 20
            )

        users = user_crud.get_users(
            db,
            is_active=is_active,
            search=search,
            pagination_params=pagination_params,
            response=response,
        )
        return users
    except DatabaseError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@user_router.get("/me", response_model=UserSchema)
async def read_users_me(db: GetDBDep, current_user: GetCurrentUserDep) -> UserSchema:
    """Reads and returns the current user."""
    return current_user


@user_router.post("/", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
async def create_user(
    db: GetDBDep,
    current_user: GetCurrentAdminUserDep,
    user_data: UserCreateSchema,
) -> UserSchema:
    """Creates a new user account."""
    try:
        user = user_crud.add_user(db, current_user, user_data)
        return user
    except ConflictError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except DatabaseError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@user_router.put("/{user_id}", response_model=UserSchema)
async def update_user(
    db: GetDBDep,
    current_user: GetCurrentAdminUserDep,
    user_id: int,
    user_data: UserUpdateSchema,
) -> UserSchema:
    """Updates a specific user from the database."""
    if current_user.user_id == user_id:
        if user_data.username is not None and user_data.username != current_user.username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot change your own username while signed in.",
            )
        if user_data.is_admin is False:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot remove your own admin access.",
            )
        if user_data.is_active is False:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot deactivate your own account.",
            )

    try:
        user = user_crud.update_user_by_id(db, current_user, user_id, user_data)
        return user
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ConflictError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except DatabaseError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
