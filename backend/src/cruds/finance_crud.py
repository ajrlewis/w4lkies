from datetime import datetime
from typing import Any, Literal

from loguru import logger
from sqlalchemy import desc, or_
from sqlalchemy.exc import SQLAlchemyError

from database import SessionLocal
from exceptions import ConflictError, DatabaseError, NotFoundError
from models import (
    BankStatementImport,
    BankTransaction,
    Customer,
    Expense,
    Invoice,
    User,
)
from services.revolut_import_service import parse_statement_file

AUTO_MATCH_CONFIDENCE_THRESHOLD = 0.9
SUGGESTION_LIMIT = 3


def import_revolut_statement(
    db: SessionLocal,
    current_user: User,
    filename: str,
    content: bytes,
    auto_match: bool = True,
) -> dict[str, Any]:
    records = parse_statement_file(filename=filename, content=content)
    if not records:
        raise DatabaseError(
            "No valid transaction rows were found in the uploaded statement."
        )

    lower_name = filename.lower()
    file_type = "xlsx" if lower_name.endswith(".xlsx") else "csv"
    transaction_dates = [record["transaction_date"] for record in records]
    currencies = [
        record.get("currency")
        for record in records
        if record.get("currency") and str(record.get("currency")).strip()
    ]
    currency = max(set(currencies), key=currencies.count) if currencies else None

    statement_import = BankStatementImport(
        source="revolut",
        file_name=filename,
        file_type=file_type,
        currency=currency,
        date_start=min(transaction_dates) if transaction_dates else None,
        date_end=max(transaction_dates) if transaction_dates else None,
        transaction_count=0,
        imported_by=current_user.user_id,
        created_by=current_user.user_id,
        updated_by=current_user.user_id,
    )

    transactions: list[BankTransaction] = []
    seen_external_ids: set[str] = set()
    for record in records:
        external_id = record.get("external_id")
        if external_id and external_id in seen_external_ids:
            continue
        if external_id:
            seen_external_ids.add(external_id)

        transaction = BankTransaction(
            statement_import=statement_import,
            transaction_date=record["transaction_date"],
            amount=float(record["amount"]),
            currency=record.get("currency"),
            description=record.get("description"),
            counterparty=record.get("counterparty"),
            transaction_type=record.get("transaction_type"),
            status=record.get("status"),
            external_id=external_id,
            raw_reference=record.get("raw_reference"),
            created_by=current_user.user_id,
            updated_by=current_user.user_id,
        )
        transactions.append(transaction)

    if not transactions:
        raise DatabaseError(
            "No importable transactions were found after removing duplicate rows."
        )

    try:
        db.add(statement_import)
        db.flush()
        db.add_all(transactions)
        db.flush()
        statement_import.transaction_count = len(transactions)

        auto_matched = 0
        if auto_match:
            for transaction in transactions:
                matched = _auto_match_transaction(
                    db=db, transaction=transaction, current_user=current_user
                )
                if matched:
                    auto_matched += 1

        db.commit()
        db.refresh(statement_import)

        summary = _get_import_with_counts(db, statement_import.bank_statement_import_id)
        return {
            "statement_import": summary,
            "transactions_created": len(transactions),
            "auto_matched": auto_matched,
        }
    except SQLAlchemyError as e:
        db.rollback()
        detail = f"Failed to import Revolut statement: {e}"
        logger.error(detail)
        raise DatabaseError(detail)


def list_statement_imports(db: SessionLocal, limit: int = 20) -> list[dict[str, Any]]:
    imports = (
        db.query(BankStatementImport)
        .order_by(desc(BankStatementImport.imported_at))
        .limit(limit)
        .all()
    )
    return [
        _get_import_with_counts(db, statement_import.bank_statement_import_id)
        for statement_import in imports
    ]


def get_statement_import_summary(
    db: SessionLocal, bank_statement_import_id: int
) -> dict[str, Any]:
    statement_import = _get_statement_import(db, bank_statement_import_id)
    transactions = (
        db.query(BankTransaction)
        .filter(BankTransaction.bank_statement_import_id == bank_statement_import_id)
        .all()
    )

    matched_transactions = [
        transaction
        for transaction in transactions
        if transaction.matched_invoice_id is not None
        or transaction.matched_expense_id is not None
    ]
    total_inflows = sum(
        transaction.amount for transaction in transactions if transaction.amount > 0
    )
    total_outflows = sum(
        transaction.amount for transaction in transactions if transaction.amount < 0
    )

    return {
        "total_transactions": len(transactions),
        "matched_transactions": len(matched_transactions),
        "unmatched_transactions": len(transactions) - len(matched_transactions),
        "total_inflows": total_inflows,
        "total_outflows": total_outflows,
        "period_start": statement_import.date_start,
        "period_end": statement_import.date_end,
    }


def list_transactions_for_import(
    db: SessionLocal,
    bank_statement_import_id: int,
    matched: bool | None = None,
    search: str | None = None,
    limit: int = 400,
) -> list[dict[str, Any]]:
    _get_statement_import(db, bank_statement_import_id)
    query = db.query(BankTransaction).filter(
        BankTransaction.bank_statement_import_id == bank_statement_import_id
    )

    if matched is True:
        query = query.filter(
            or_(
                BankTransaction.matched_invoice_id.isnot(None),
                BankTransaction.matched_expense_id.isnot(None),
            )
        )
    elif matched is False:
        query = query.filter(
            BankTransaction.matched_invoice_id.is_(None),
            BankTransaction.matched_expense_id.is_(None),
        )

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                BankTransaction.description.ilike(search_term),
                BankTransaction.counterparty.ilike(search_term),
                BankTransaction.external_id.ilike(search_term),
                BankTransaction.raw_reference.ilike(search_term),
            )
        )

    transactions = (
        query.order_by(
            desc(BankTransaction.transaction_date),
            desc(BankTransaction.bank_transaction_id),
        )
        .limit(limit)
        .all()
    )
    return [_transaction_to_payload(db, transaction) for transaction in transactions]


def manually_match_transaction(
    db: SessionLocal,
    current_user: User,
    bank_transaction_id: int,
    invoice_id: int | None = None,
    expense_id: int | None = None,
    note: str | None = None,
) -> dict[str, Any]:
    transaction = _get_transaction(db, bank_transaction_id)
    _apply_match(
        db=db,
        transaction=transaction,
        current_user=current_user,
        invoice_id=invoice_id,
        expense_id=expense_id,
        method="manual",
        confidence=1.0,
        note=note,
    )
    try:
        db.commit()
        db.refresh(transaction)
        return _transaction_to_payload(db, transaction)
    except SQLAlchemyError as e:
        db.rollback()
        detail = f"Failed to match transaction {bank_transaction_id}: {e}"
        logger.error(detail)
        raise DatabaseError(detail)


def unmatch_transaction(
    db: SessionLocal, current_user: User, bank_transaction_id: int
) -> dict[str, Any]:
    transaction = _get_transaction(db, bank_transaction_id)
    transaction.matched_invoice_id = None
    transaction.matched_expense_id = None
    transaction.match_method = None
    transaction.match_confidence = None
    transaction.match_note = None
    transaction.matched_at = None
    transaction.matched_by = None
    transaction.updated_by = current_user.user_id

    try:
        db.commit()
        db.refresh(transaction)
        return _transaction_to_payload(db, transaction)
    except SQLAlchemyError as e:
        db.rollback()
        detail = f"Failed to unmatch transaction {bank_transaction_id}: {e}"
        logger.error(detail)
        raise DatabaseError(detail)


def auto_match_import(
    db: SessionLocal, current_user: User, bank_statement_import_id: int
) -> dict[str, Any]:
    _get_statement_import(db, bank_statement_import_id)
    transactions = (
        db.query(BankTransaction)
        .filter(BankTransaction.bank_statement_import_id == bank_statement_import_id)
        .filter(BankTransaction.matched_invoice_id.is_(None))
        .filter(BankTransaction.matched_expense_id.is_(None))
        .all()
    )
    auto_matched = 0
    for transaction in transactions:
        if _auto_match_transaction(db=db, transaction=transaction, current_user=current_user):
            auto_matched += 1

    try:
        db.commit()
    except SQLAlchemyError as e:
        db.rollback()
        detail = (
            f"Failed to run auto-match for import {bank_statement_import_id}: {e}"
        )
        logger.error(detail)
        raise DatabaseError(detail)

    summary = get_statement_import_summary(db, bank_statement_import_id)
    summary["auto_matched"] = auto_matched
    return summary


def _get_statement_import(
    db: SessionLocal, bank_statement_import_id: int
) -> BankStatementImport:
    statement_import = db.get(BankStatementImport, bank_statement_import_id)
    if not statement_import:
        raise NotFoundError(f"Statement import {bank_statement_import_id} not found.")
    return statement_import


def _get_transaction(db: SessionLocal, bank_transaction_id: int) -> BankTransaction:
    transaction = db.get(BankTransaction, bank_transaction_id)
    if not transaction:
        raise NotFoundError(f"Bank transaction {bank_transaction_id} not found.")
    return transaction


def _get_import_with_counts(
    db: SessionLocal, bank_statement_import_id: int
) -> dict[str, Any]:
    statement_import = _get_statement_import(db, bank_statement_import_id)
    matched_count = (
        db.query(BankTransaction)
        .filter(BankTransaction.bank_statement_import_id == bank_statement_import_id)
        .filter(
            or_(
                BankTransaction.matched_invoice_id.isnot(None),
                BankTransaction.matched_expense_id.isnot(None),
            )
        )
        .count()
    )
    unmatched_count = statement_import.transaction_count - matched_count
    return {
        "bank_statement_import_id": statement_import.bank_statement_import_id,
        "source": statement_import.source,
        "file_name": statement_import.file_name,
        "file_type": statement_import.file_type,
        "currency": statement_import.currency,
        "date_start": statement_import.date_start,
        "date_end": statement_import.date_end,
        "transaction_count": statement_import.transaction_count,
        "imported_at": statement_import.imported_at,
        "imported_by": statement_import.imported_by,
        "matched_count": matched_count,
        "unmatched_count": unmatched_count,
    }


def _transaction_to_payload(db: SessionLocal, transaction: BankTransaction) -> dict[str, Any]:
    matched_label = None
    if transaction.invoice is not None:
        matched_label = _invoice_label(transaction.invoice)
    elif transaction.expense is not None:
        matched_label = _expense_label(transaction.expense)

    suggestions: list[dict[str, Any]] = []
    if transaction.matched_invoice_id is None and transaction.matched_expense_id is None:
        suggestions = _suggest_matches(db=db, transaction=transaction)

    return {
        "bank_transaction_id": transaction.bank_transaction_id,
        "transaction_date": transaction.transaction_date,
        "amount": transaction.amount,
        "currency": transaction.currency,
        "description": transaction.description,
        "counterparty": transaction.counterparty,
        "transaction_type": transaction.transaction_type,
        "status": transaction.status,
        "external_id": transaction.external_id,
        "raw_reference": transaction.raw_reference,
        "matched_invoice_id": transaction.matched_invoice_id,
        "matched_expense_id": transaction.matched_expense_id,
        "matched_at": transaction.matched_at,
        "match_method": transaction.match_method,
        "match_confidence": transaction.match_confidence,
        "match_note": transaction.match_note,
        "matched_label": matched_label,
        "suggestions": suggestions,
    }


def _auto_match_transaction(
    db: SessionLocal, transaction: BankTransaction, current_user: User
) -> bool:
    suggestions = _suggest_matches(db=db, transaction=transaction)
    if not suggestions:
        return False

    best = suggestions[0]
    if best["confidence"] < AUTO_MATCH_CONFIDENCE_THRESHOLD:
        return False

    _apply_match(
        db=db,
        transaction=transaction,
        current_user=current_user,
        invoice_id=best["entity_id"] if best["entity_type"] == "invoice" else None,
        expense_id=best["entity_id"] if best["entity_type"] == "expense" else None,
        method="auto",
        confidence=best["confidence"],
        note="Auto-matched by amount, date and reference similarity.",
    )
    return True


def _apply_match(
    db: SessionLocal,
    transaction: BankTransaction,
    current_user: User,
    invoice_id: int | None,
    expense_id: int | None,
    method: Literal["manual", "auto"],
    confidence: float,
    note: str | None,
):
    if invoice_id and expense_id:
        raise ConflictError("A transaction can only be matched to one target.")
    if not invoice_id and not expense_id:
        raise ConflictError("A match target is required.")

    if invoice_id:
        invoice = db.get(Invoice, invoice_id)
        if not invoice:
            raise NotFoundError(f"Invoice {invoice_id} not found.")
        existing = (
            db.query(BankTransaction)
            .filter(BankTransaction.matched_invoice_id == invoice_id)
            .filter(BankTransaction.bank_transaction_id != transaction.bank_transaction_id)
            .first()
        )
        if existing:
            raise ConflictError(
                f"Invoice {invoice_id} is already matched to another bank transaction."
            )
        transaction.matched_invoice_id = invoice_id
        transaction.matched_expense_id = None

    if expense_id:
        expense = db.get(Expense, expense_id)
        if not expense:
            raise NotFoundError(f"Expense {expense_id} not found.")
        existing = (
            db.query(BankTransaction)
            .filter(BankTransaction.matched_expense_id == expense_id)
            .filter(BankTransaction.bank_transaction_id != transaction.bank_transaction_id)
            .first()
        )
        if existing:
            raise ConflictError(
                f"Expense {expense_id} is already matched to another bank transaction."
            )
        transaction.matched_expense_id = expense_id
        transaction.matched_invoice_id = None

    transaction.match_method = method
    transaction.match_confidence = confidence
    transaction.match_note = note
    transaction.matched_at = datetime.utcnow()
    transaction.matched_by = current_user.user_id
    transaction.updated_by = current_user.user_id


def _suggest_matches(
    db: SessionLocal, transaction: BankTransaction
) -> list[dict[str, Any]]:
    if transaction.amount > 0:
        return _suggest_invoice_matches(db, transaction)
    if transaction.amount < 0:
        return _suggest_expense_matches(db, transaction)
    return []


def _suggest_invoice_matches(
    db: SessionLocal, transaction: BankTransaction
) -> list[dict[str, Any]]:
    target_amount = abs(transaction.amount)
    query = (
        db.query(Invoice)
        .outerjoin(Customer, Invoice.customer_id == Customer.customer_id)
        .filter(Invoice.price_total >= target_amount - 5.0)
        .filter(Invoice.price_total <= target_amount + 5.0)
        .order_by(desc(Invoice.date_issued), desc(Invoice.invoice_id))
        .limit(50)
    )

    suggestions = []
    for invoice in query.all():
        existing = (
            db.query(BankTransaction.bank_transaction_id)
            .filter(BankTransaction.matched_invoice_id == invoice.invoice_id)
            .filter(BankTransaction.bank_transaction_id != transaction.bank_transaction_id)
            .first()
        )
        if existing:
            continue

        confidence = _score_candidate(
            target_amount=target_amount,
            candidate_amount=invoice.price_total,
            transaction_date=transaction.transaction_date,
            candidate_date=invoice.date_paid or invoice.date_issued,
            transaction_text=_transaction_search_text(transaction),
            candidate_text=f"{invoice.reference} {_invoice_customer_name(invoice)}",
        )
        if confidence < 0.45:
            continue
        suggestions.append(
            {
                "entity_type": "invoice",
                "entity_id": invoice.invoice_id,
                "label": _invoice_label(invoice),
                "amount": float(invoice.price_total),
                "confidence": round(confidence, 4),
            }
        )

    suggestions.sort(key=lambda item: item["confidence"], reverse=True)
    return suggestions[:SUGGESTION_LIMIT]


def _suggest_expense_matches(
    db: SessionLocal, transaction: BankTransaction
) -> list[dict[str, Any]]:
    target_amount = abs(transaction.amount)
    query = (
        db.query(Expense)
        .filter(Expense.price >= target_amount - 5.0)
        .filter(Expense.price <= target_amount + 5.0)
        .order_by(desc(Expense.date), desc(Expense.expense_id))
        .limit(50)
    )

    suggestions = []
    for expense in query.all():
        existing = (
            db.query(BankTransaction.bank_transaction_id)
            .filter(BankTransaction.matched_expense_id == expense.expense_id)
            .filter(BankTransaction.bank_transaction_id != transaction.bank_transaction_id)
            .first()
        )
        if existing:
            continue

        confidence = _score_candidate(
            target_amount=target_amount,
            candidate_amount=expense.price,
            transaction_date=transaction.transaction_date,
            candidate_date=expense.date,
            transaction_text=_transaction_search_text(transaction),
            candidate_text=f"{expense.category or ''} {expense.description or ''}",
        )
        if confidence < 0.45:
            continue

        suggestions.append(
            {
                "entity_type": "expense",
                "entity_id": expense.expense_id,
                "label": _expense_label(expense),
                "amount": float(expense.price),
                "confidence": round(confidence, 4),
            }
        )

    suggestions.sort(key=lambda item: item["confidence"], reverse=True)
    return suggestions[:SUGGESTION_LIMIT]


def _score_candidate(
    target_amount: float,
    candidate_amount: float,
    transaction_date,
    candidate_date,
    transaction_text: str,
    candidate_text: str,
) -> float:
    amount_diff = abs(target_amount - float(candidate_amount))
    if amount_diff <= 0.01:
        amount_score = 0.7
    elif amount_diff <= 0.5:
        amount_score = 0.55
    elif amount_diff <= 1.0:
        amount_score = 0.45
    elif amount_diff <= 5.0:
        amount_score = 0.2
    else:
        amount_score = 0.0

    date_delta = abs((transaction_date - candidate_date).days)
    if date_delta <= 2:
        date_score = 0.2
    elif date_delta <= 7:
        date_score = 0.15
    elif date_delta <= 14:
        date_score = 0.1
    elif date_delta <= 31:
        date_score = 0.05
    else:
        date_score = 0.0

    text_score = 0.0
    transaction_tokens = set(_normalize_tokens(transaction_text))
    candidate_tokens = set(_normalize_tokens(candidate_text))
    if transaction_tokens and candidate_tokens:
        overlap = transaction_tokens.intersection(candidate_tokens)
        if overlap:
            text_score = min(0.25, 0.06 * len(overlap))

    return amount_score + date_score + text_score


def _transaction_search_text(transaction: BankTransaction) -> str:
    return " ".join(
        value
        for value in [
            transaction.description or "",
            transaction.counterparty or "",
            transaction.raw_reference or "",
            transaction.external_id or "",
        ]
        if value
    )


def _normalize_tokens(value: str) -> list[str]:
    normalized = "".join(ch.lower() if ch.isalnum() else " " for ch in value)
    return [token for token in normalized.split() if len(token) > 2]


def _invoice_customer_name(invoice: Invoice) -> str:
    return invoice.customer.name if invoice.customer else ""


def _invoice_label(invoice: Invoice) -> str:
    customer_name = _invoice_customer_name(invoice)
    if customer_name:
        return f"Invoice {invoice.reference} ({customer_name})"
    return f"Invoice {invoice.reference}"


def _expense_label(expense: Expense) -> str:
    category = expense.category or "Expense"
    detail = expense.description or "No description"
    return f"{category}: {detail}"
