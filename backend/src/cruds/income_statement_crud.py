from typing import Optional

from loguru import logger
from sqlalchemy.exc import SQLAlchemyError

from database import SessionLocal
from exceptions import NotFoundError, DatabaseError
from cruds import invoice_crud, expense_crud
from models import User
from services import income_statement_download_service


def generate_income_statement(db: SessionLocal, date_start: str, date_end: str):
    # Invoices (Revenue)
    invoices = invoice_crud.get_invoices(db, date_min=date_start, date_max=date_end)
    number_of_invoices = len(invoices)
    invoice_prices = [invoice.price_total for invoice in invoices]
    price_total_invoices = sum(invoice_prices)
    price_average_invoices = (
        price_total_invoices / number_of_invoices if number_of_invoices else 0.0
    )

    # Expenses
    expenses = expense_crud.get_expenses(db, date_min=date_start, date_max=date_end)
    number_of_expenses = len(expenses)
    expense_prices = [expense.price for expense in expenses]
    price_total_expenses = sum(expense_prices)
    price_average_expenses = (
        price_total_expenses / number_of_expenses if number_of_expenses else 0.0
    )

    # Profit Calculations
    profit_gross = price_total_invoices - price_total_expenses
    profit_net = profit_gross  # For now, assume gross = net (no taxes/interest tracked separately)

    # Margins
    profit_margin_gross = (
        (profit_gross / price_total_invoices) * 100.0 if price_total_invoices else 0.0
    )
    profit_margin_net = (
        (profit_net / price_total_invoices) * 100.0 if price_total_invoices else 0.0
    )

    return {
        "date_start": date_start,
        "date_end": date_end,
        "number_of_invoices": number_of_invoices,
        "price_total_invoices": price_total_invoices,
        "price_average_invoices": price_average_invoices,
        "number_of_expenses": number_of_expenses,
        "price_total_expenses": price_total_expenses,
        "price_average_expenses": price_average_expenses,
        "profit_gross": profit_gross,
        "profit_margin_gross": profit_margin_gross,
        "profit_net": profit_net,
        "profit_margin_net": profit_margin_net,
    }


def download_income_statement(db: SessionLocal, date_start: str, date_end: str):
    income_statement = generate_income_statement(db, date_start, date_end)
    try:
        pdf_file, pdf_filepath = income_statement_download_service.create(
            income_statement
        )
        logger.debug(f"Created {pdf_filepath}, {type(pdf_file)}")
        return pdf_file, pdf_filepath
    except Exception as e:
        detail = f"An error occurred downloading income statement: {e}"
        logger.error(detail)
        raise DatabaseError(detail)
