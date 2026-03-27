from fastapi import APIRouter, HTTPException, status
from fastapi.responses import FileResponse, StreamingResponse
from loguru import logger

from cruds import income_statement_crud
from dependencies import GetDBDep, GetCurrentAdminUserDep
from exceptions import DatabaseError, NotFoundError
from schemas.income_statement_schema import IncomeStatementBaseSchema

income_statement_router = APIRouter(
    prefix="/income_statements", tags=["Income Statements"]
)


@income_statement_router.get("/generate")
async def generate_income_statement(db: GetDBDep):
    """Creates and returns an income statement between two dates."""
    date_start = "2023-10-19"
    date_end = "2024-10-31"
    try:
        data = income_statement_crud.generate_income_statement(
            db, date_start=date_start, date_end=date_end
        )
        return data
    except DatabaseError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@income_statement_router.get("/download")
async def download_income_statement(
    db: GetDBDep,
    # db: GetDBDep, current_user: GetCurrentAdminUserDep
):
    """Downloads and returns an income statement between two dates."""
    date_start = "2023-10-19"
    date_end = "2024-10-31"
    try:
        (
            income_statement_pdf,
            income_statement_filename,
        ) = income_statement_crud.download_income_statement(
            db, date_start=date_start, date_end=date_end
        )
        return StreamingResponse(
            income_statement_pdf,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={income_statement_filename}"
            },
        )
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except DatabaseError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@income_statement_router.get("/", response_model=list[IncomeStatementBaseSchema])
async def read_income_statements(db: GetDBDep) -> list[IncomeStatementBaseSchema]:
    """Reads and returns all income_statements from the database."""
    try:
        income_statements = income_statement_crud.get_income_statements(db)
        return income_statements
    except DatabaseError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@income_statement_router.get(
    "/{income_statement_id}", response_model=IncomeStatementBaseSchema
)
async def read_income_statement(
    db: GetDBDep, income_statement_id: int
) -> IncomeStatementBaseSchema:
    """Reads and returns a specific income_statement from the database."""
    try:
        income_statement = income_statement_crud.get_income_statement_by_id(
            db, income_statement_id
        )
        return income_statement
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except DatabaseError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@income_statement_router.delete("/{income_statement_id}")
async def delete_income_statement(
    db: GetDBDep, current_user: GetCurrentAdminUserDep, income_statement_id: int
):
    """Deletes a specific income_statement in the database."""
    try:
        income_statement = income_statement_crud.delete_income_statement_by_id(
            db, income_statement_id
        )
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
