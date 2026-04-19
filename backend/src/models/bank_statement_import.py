from datetime import datetime

from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from database import Base
from models.timestamp_mixin import TimestampMixin


class BankStatementImport(TimestampMixin, Base):
    __tablename__ = "bank_statement_import"

    bank_statement_import_id = Column(Integer, primary_key=True, autoincrement=True)
    source = Column(String(50), nullable=False, default="revolut")
    file_name = Column(String(255), nullable=False)
    file_type = Column(String(16), nullable=False)
    currency = Column(String(16), nullable=True)
    date_start = Column(Date, nullable=True)
    date_end = Column(Date, nullable=True)
    transaction_count = Column(Integer, nullable=False, default=0)
    imported_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    imported_by = Column(Integer, ForeignKey("user.user_id"), nullable=False)

    transactions = relationship(
        "BankTransaction",
        back_populates="statement_import",
        cascade="all, delete-orphan",
    )
