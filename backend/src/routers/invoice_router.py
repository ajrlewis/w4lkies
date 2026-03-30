from typing import Optional

from fastapi import APIRouter, HTTPException, Query, Response, status
from loguru import logger

from cruds import invoice_crud
from dependencies import GetDBDep, GetCurrentAdminUserDep
from exceptions import DatabaseError, NotFoundError
from schemas.invoice_schema import (
    InvoiceGenerateAllResultSchema,
    InvoiceGenerateAllSchema,
    InvoiceSchema,
    InvoiceGenerateSchema,
)
from schemas.pagination_schema import PaginationParamsSchema

invoice_router = APIRouter(prefix="/invoices", tags=["Invoices"])


@invoice_router.get("/", response_model=list[InvoiceSchema])
async def read_invoices(
    db: GetDBDep,
    response: Response,
    # current_user: GetCurrentAdminUserDep,
    is_paid: Optional[bool] = Query(
        None, description="Filter invoices by paid status. true=paid, false=pending."
    ),
    search: Optional[str] = Query(
        None, description="Optional search term for invoice reference/customer name."
    ),
    page: Optional[int] = Query(
        None, ge=1, description="Optional page number. If omitted, returns full list."
    ),
    page_size: Optional[int] = Query(
        None, ge=1, description="Optional page size. Used when pagination is enabled."
    ),
) -> list[InvoiceSchema]:
    """Reads and returns all invoices from the database."""
    try:
        pagination_params = None
        if page is not None or page_size is not None:
            pagination_params = PaginationParamsSchema(
                page=page or 1, page_size=page_size or 20
            )

        invoices = invoice_crud.get_invoices(
            db,
            is_paid=is_paid,
            search=search,
            pagination_params=pagination_params,
            response=response,
        )
        return invoices
    except DatabaseError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@invoice_router.get("/{invoice_id}", response_model=InvoiceSchema)
async def read_invoice(
    db: GetDBDep,
    # current_user: GetCurrentAdminUserDep,
    invoice_id: int,
) -> InvoiceSchema:
    """Reads and returns a specific invoice from the database."""
    try:
        invoice = invoice_crud.get_invoice_by_id(db, invoice_id)
        return invoice
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except DatabaseError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@invoice_router.post("/generate")
async def generate_invoice(
    db: GetDBDep,
    current_user: GetCurrentAdminUserDep,
    data: InvoiceGenerateSchema,
):
    """Generates an invoice for a specific customer over a date range."""
    try:
        invoice = invoice_crud.generate_invoice(
            db, current_user, data.customer_id, data.date_start, data.date_end
        )
        return invoice
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except DatabaseError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@invoice_router.post("/generate/all", response_model=InvoiceGenerateAllResultSchema)
async def generate_invoices_for_all_customers(
    db: GetDBDep,
    current_user: GetCurrentAdminUserDep,
    data: InvoiceGenerateAllSchema,
):
    """Generates invoices for all customers with uninvoiced bookings in a date range."""
    try:
        result = invoice_crud.generate_invoices_for_all_customers(
            db, current_user, data.date_start, data.date_end
        )
        return result
    except DatabaseError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@invoice_router.get("/{invoice_id}/download")
async def download_invoice(
    db: GetDBDep,
    invoice_id: int
    # db: GetDBDep, current_user: GetCurrentAdminUserDep, invoice_id: int
):
    """Downloads a specific invoice from the database."""
    try:
        invoice_pdf, invoice_filename = invoice_crud.download_invoice_by_id(
            db, invoice_id
        )
        logger.debug(f"{invoice_filename = }")
        invoice_pdf.seek(0)
        return Response(
            content=invoice_pdf.read(),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={invoice_filename}"},
        )
        # return FileResponse(
        #     invoice_pdf, filename=invoice_filename, media_type="application/pdf"
        # )
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except DatabaseError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@invoice_router.put("/{invoice_id}/mark_as_paid", response_model=InvoiceSchema)
async def mark_invoice_as_paid(
    db: GetDBDep, current_user: GetCurrentAdminUserDep, invoice_id: int
) -> InvoiceSchema:
    """Sets the date paid for a specific invoice from the database."""
    try:
        invoice = invoice_crud.mark_invoice_paid_by_id(db, current_user, invoice_id)
        return invoice
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except DatabaseError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@invoice_router.delete("/{invoice_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_invoice(
    db: GetDBDep, current_user: GetCurrentAdminUserDep, invoice_id: int
) -> Response:
    """Deletes a specific invoice from the database."""
    try:
        invoice_crud.delete_invoice_by_id(db, invoice_id)
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except DatabaseError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
