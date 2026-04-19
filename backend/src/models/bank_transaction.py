from sqlalchemy import (
    CheckConstraint,
    Column,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from database import Base
from models.timestamp_mixin import TimestampMixin


class BankTransaction(TimestampMixin, Base):
    __tablename__ = "bank_transaction"

    bank_transaction_id = Column(Integer, primary_key=True, autoincrement=True)
    bank_statement_import_id = Column(
        Integer, ForeignKey("bank_statement_import.bank_statement_import_id"), nullable=False
    )
    transaction_date = Column(Date, nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(16), nullable=True)
    description = Column(String(1024), nullable=True)
    counterparty = Column(String(255), nullable=True)
    transaction_type = Column(String(100), nullable=True)
    status = Column(String(100), nullable=True)
    external_id = Column(String(255), nullable=True)
    raw_reference = Column(String(255), nullable=True)

    matched_invoice_id = Column(Integer, ForeignKey("invoice.invoice_id"), nullable=True)
    matched_expense_id = Column(Integer, ForeignKey("expense.expense_id"), nullable=True)
    matched_at = Column(DateTime, nullable=True)
    matched_by = Column(Integer, ForeignKey("user.user_id"), nullable=True)
    match_method = Column(String(32), nullable=True)
    match_confidence = Column(Float, nullable=True)
    match_note = Column(String(1024), nullable=True)

    statement_import = relationship("BankStatementImport", back_populates="transactions")
    invoice = relationship("Invoice", backref="bank_transactions")
    expense = relationship("Expense", backref="bank_transactions")

    __table_args__ = (
        UniqueConstraint(
            "bank_statement_import_id",
            "external_id",
            name="uq_bank_transaction_import_external_id",
        ),
        CheckConstraint(
            "(matched_invoice_id IS NULL) OR (matched_expense_id IS NULL)",
            name="ck_bank_transaction_single_match_target",
        ),
    )
