from fastapi import APIRouter, HTTPException, status, Response
from loguru import logger

from cruds import expense_crud
from dependencies import GetDBDep, GetCurrentAdminUserDep, GetPaginationParamsDep
from exceptions import DatabaseError, NotFoundError
from schemas.expense_schema import (
    ExpenseSchema,
    ExpenseUpdateSchema,
    ExpenseCreateSchema,
)


expense_router = APIRouter(prefix="/expenses", tags=["Expenses"])


@expense_router.get("/categories", response_model=list[str])
async def read_expense_categories(db: GetDBDep) -> list[str]:
    """Reads and returns all expense categories from the database."""
    try:
        expenses = expense_crud.get_expense_categories(db)
        return expenses
    except DatabaseError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@expense_router.get("/", response_model=list[ExpenseSchema])
async def read_expenses(
    db: GetDBDep,
    current_user: GetCurrentAdminUserDep,
    pagination_params: GetPaginationParamsDep,
    response: Response,
) -> list[ExpenseSchema]:
    """Reads and returns all expenses from the database."""
    try:
        expenses = expense_crud.get_expenses(
            db, pagination_params=pagination_params, response=response
        )
        return expenses
    except DatabaseError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@expense_router.put("/{expense_id}", response_model=ExpenseSchema)
async def update_expense(
    db: GetDBDep,
    current_user: GetCurrentAdminUserDep,
    expense_id: int,
    expense_data: ExpenseUpdateSchema,
) -> ExpenseSchema:
    """Updates the properties of a specific expense in the database."""
    logger.debug(f"{expense_data = }")
    try:
        expense = expense_crud.update_expense_by_id(
            db, current_user, expense_id, expense_data
        )
        return expense
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


@expense_router.delete("/{expense_id}")
async def delete_expense(
    db: GetDBDep, current_user: GetCurrentAdminUserDep, expense_id: int
):
    """Deletes a specific expense in the database."""
    try:
        expense = expense_crud.delete_expense_by_id(db, expense_id)
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


@expense_router.post("/", response_model=ExpenseSchema)
async def create_expense(
    db: GetDBDep,
    current_user: GetCurrentAdminUserDep,
    expense_data: ExpenseCreateSchema,
) -> ExpenseSchema:
    """Creates a expense to add to the database."""
    try:
        expense = expense_crud.add_expense(db, current_user, expense_data)
        return expense
    except DatabaseError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}",
        )
