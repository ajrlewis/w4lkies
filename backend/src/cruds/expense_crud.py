from typing import Optional

from fastapi import Response
from loguru import logger
from sqlalchemy import desc, distinct
from sqlalchemy.exc import SQLAlchemyError

from database import SessionLocal
from exceptions import NotFoundError, DatabaseError
from models import User, Customer, Expense, Vet
from pagination import paginate
from schemas.expense_schema import ExpenseUpdateSchema, ExpenseCreateSchema
from schemas.pagination_schema import PaginationParamsSchema


def get_expenses(
    db: SessionLocal,
    pagination_params: Optional[PaginationParamsSchema] = None,
    response: Optional[Response] = None,
    date_min: Optional[str] = None,
    date_max: Optional[str] = None,
) -> list[Expense]:
    query = db.query(Expense)
    if date_min:
        query = query.filter(Expense.date >= date_min)
    if date_max:
        query = query.filter(Expense.date <= date_max)
    query = query.order_by(desc(Expense.date))
    if pagination_params and response:
        results = paginate(query, pagination_params, response)
    else:
        results = query.all()
    return results


def get_expense_categories(db: SessionLocal) -> list[str]:
    categories = [
        "Marketing",
        "Website",
        "Freelance",
        "Insurance",
        "Clothing",
        "Dog Treats / Games / Poo Bags",
        "Miscellaneous",
        "Entertainment",
        "Team Expenses",
        "Client Gifts",
        "Transportation",
    ]
    return categories


def get_expense_by_id(db: SessionLocal, expense_id: int) -> Expense:
    expense = db.get(Expense, expense_id)
    if not expense:
        raise NotFoundError(f"Expense {expense_id} not found")
    return expense


def update_expense_by_id(
    db: SessionLocal,
    current_user: User,
    expense_id: int,
    expense_data: ExpenseUpdateSchema,
) -> Expense:
    logger.debug(f"{current_user = } {expense_data = }")
    expense = get_expense_by_id(db, expense_id)
    if not expense:
        raise NotFoundError(f"Expense {expense_id} not found")

    if date := expense_data.date:
        expense.date = date
    if price := expense_data.price:
        expense.price = price
    if category := expense_data.category:
        expense.category = category
    if description := expense_data.description:
        expense.description = description

    try:
        expense.updated_by = current_user.user_id
        db.commit()
        return expense
    except Excpetion as e:
        detail = f"Error updating expense: {e}"
        logger.error(detail)
        db.rollback()
        raise DatabaseError("An error occurred while updating the expense.")


def add_expense(
    db: SessionLocal, current_user: User, expense_data: ExpenseCreateSchema
) -> Expense:
    logger.debug(f"{expense_data = }")
    expense = Expense(
        date=expense_data.date,
        price=expense_data.price,
        category=expense_data.category,
        description=expense_data.description,
    )
    try:
        expense.created_by = current_user.user_id
        expense.updated_by = current_user.user_id
        db.add(expense)
        db.commit()
        return expense
    except SQLAlchemyError as e:
        detail = f"Error adding expense: {e}"
        logger.error(detail)
        db.rollback()
        raise DatabaseError("An error occurred while adding a expense.")


def delete_expense_by_id(db: SessionLocal, expense_id: int):
    expense = get_expense_by_id(db, expense_id)
    if not expense:
        raise NotFoundError(f"Expense {expense_id} not found")
    try:
        db.delete(expense)
        db.commit()
    except Exception as e:
        raise DatabaseError("An error occurred while deleting the expense.")
