from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field, model_validator


class MatchSuggestionSchema(BaseModel):
    entity_type: Literal["invoice", "expense"]
    entity_id: int
    label: str
    amount: float
    confidence: float


class BankTransactionBaseSchema(BaseModel):
    bank_transaction_id: int
    transaction_date: date
    amount: float
    currency: str | None = None
    description: str | None = None
    counterparty: str | None = None
    transaction_type: str | None = None
    status: str | None = None
    external_id: str | None = None
    raw_reference: str | None = None
    matched_invoice_id: int | None = None
    matched_expense_id: int | None = None
    matched_at: datetime | None = None
    match_method: str | None = None
    match_confidence: float | None = None
    match_note: str | None = None


class BankTransactionSchema(BankTransactionBaseSchema):
    matched_label: str | None = None
    suggestions: list[MatchSuggestionSchema] = Field(default_factory=list)

    class Config:
        from_attributes = True


class BankStatementImportSchema(BaseModel):
    bank_statement_import_id: int
    source: str
    file_name: str
    file_type: str
    currency: str | None = None
    date_start: date | None = None
    date_end: date | None = None
    transaction_count: int
    imported_at: datetime
    imported_by: int
    matched_count: int = 0
    unmatched_count: int = 0

    class Config:
        from_attributes = True


class BankImportResultSchema(BaseModel):
    statement_import: BankStatementImportSchema
    transactions_created: int
    auto_matched: int


class FinanceMatchRequestSchema(BaseModel):
    invoice_id: int | None = None
    expense_id: int | None = None
    note: str | None = None

    @model_validator(mode="after")
    def validate_target(self):
        if not self.invoice_id and not self.expense_id:
            raise ValueError("Either invoice_id or expense_id is required.")
        if self.invoice_id and self.expense_id:
            raise ValueError("Only one of invoice_id or expense_id may be provided.")
        return self


class BankImportSummarySchema(BaseModel):
    total_transactions: int
    matched_transactions: int
    unmatched_transactions: int
    total_inflows: float
    total_outflows: float
    period_start: date | None = None
    period_end: date | None = None
