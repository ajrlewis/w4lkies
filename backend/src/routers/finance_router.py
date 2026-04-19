from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, Query, UploadFile, status

from cruds import finance_crud
from dependencies import GetCurrentAdminUserDep, GetDBDep
from exceptions import ConflictError, DatabaseError, NotFoundError
from schemas.finance_schema import (
    BankImportResultSchema,
    BankImportSummarySchema,
    BankStatementImportSchema,
    BankTransactionSchema,
    FinanceMatchRequestSchema,
)

finance_router = APIRouter(prefix="/finance", tags=["Finance"])


@finance_router.post(
    "/revolut/import",
    response_model=BankImportResultSchema,
    status_code=status.HTTP_201_CREATED,
)
async def import_revolut_statement(
    db: GetDBDep,
    current_user: GetCurrentAdminUserDep,
    file: UploadFile = File(...),
    auto_match: bool = Form(True),
) -> BankImportResultSchema:
    """Import Revolut CSV/XLSX transactions and optionally auto-match to invoices/expenses."""
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must have a filename.",
        )

    lowered = file.filename.lower()
    if not lowered.endswith(".csv") and not lowered.endswith(".xlsx"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file type. Please upload a CSV or XLSX file.",
        )

    try:
        content = await file.read()
        result = finance_crud.import_revolut_statement(
            db=db,
            current_user=current_user,
            filename=file.filename,
            content=content,
            auto_match=auto_match,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except DatabaseError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@finance_router.get(
    "/revolut/imports",
    response_model=list[BankStatementImportSchema],
)
async def read_statement_imports(
    db: GetDBDep, current_user: GetCurrentAdminUserDep
) -> list[BankStatementImportSchema]:
    """List recent imported bank statements."""
    try:
        return finance_crud.list_statement_imports(db)
    except DatabaseError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@finance_router.get(
    "/revolut/imports/{bank_statement_import_id}/summary",
    response_model=BankImportSummarySchema,
)
async def read_statement_import_summary(
    db: GetDBDep,
    current_user: GetCurrentAdminUserDep,
    bank_statement_import_id: int,
) -> BankImportSummarySchema:
    """Get reconciliation summary metrics for one imported statement."""
    try:
        return finance_crud.get_statement_import_summary(
            db, bank_statement_import_id=bank_statement_import_id
        )
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except DatabaseError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@finance_router.get(
    "/revolut/imports/{bank_statement_import_id}/transactions",
    response_model=list[BankTransactionSchema],
)
async def read_statement_transactions(
    db: GetDBDep,
    current_user: GetCurrentAdminUserDep,
    bank_statement_import_id: int,
    matched: Optional[bool] = Query(
        None, description="Filter by matched status. true=matched, false=unmatched."
    ),
    search: Optional[str] = Query(
        None, description="Optional text search across transaction description/reference."
    ),
    limit: int = Query(
        400,
        ge=1,
        le=2000,
        description="Maximum number of transactions to return.",
    ),
) -> list[BankTransactionSchema]:
    """List imported transactions with match status and suggestions."""
    try:
        return finance_crud.list_transactions_for_import(
            db=db,
            bank_statement_import_id=bank_statement_import_id,
            matched=matched,
            search=search,
            limit=limit,
        )
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except DatabaseError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@finance_router.post("/revolut/transactions/{bank_transaction_id}/match")
async def match_transaction(
    db: GetDBDep,
    current_user: GetCurrentAdminUserDep,
    bank_transaction_id: int,
    payload: FinanceMatchRequestSchema,
) -> BankTransactionSchema:
    """Manually match a bank transaction to one invoice or one expense."""
    try:
        transaction = finance_crud.manually_match_transaction(
            db=db,
            current_user=current_user,
            bank_transaction_id=bank_transaction_id,
            invoice_id=payload.invoice_id,
            expense_id=payload.expense_id,
            note=payload.note,
        )
        return transaction
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ConflictError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except DatabaseError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@finance_router.post("/revolut/transactions/{bank_transaction_id}/unmatch")
async def unmatch_transaction(
    db: GetDBDep,
    current_user: GetCurrentAdminUserDep,
    bank_transaction_id: int,
) -> BankTransactionSchema:
    """Remove an existing invoice/expense match from a bank transaction."""
    try:
        return finance_crud.unmatch_transaction(
            db=db, current_user=current_user, bank_transaction_id=bank_transaction_id
        )
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except DatabaseError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@finance_router.post("/revolut/imports/{bank_statement_import_id}/auto_match")
async def rerun_auto_match(
    db: GetDBDep,
    current_user: GetCurrentAdminUserDep,
    bank_statement_import_id: int,
) -> dict:
    """Run auto-match against currently unmatched rows in an imported statement."""
    try:
        return finance_crud.auto_match_import(
            db=db,
            current_user=current_user,
            bank_statement_import_id=bank_statement_import_id,
        )
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except DatabaseError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
