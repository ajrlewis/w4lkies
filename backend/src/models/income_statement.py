from sqlalchemy import Boolean, Column, Date, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from database import Base
from models.timestamp_mixin import TimestampMixin


class IncomeStatement(TimestampMixin, Base):
    __tablename__ = "income_statement"

    income_statement_id = Column(Integer, primary_key=True)

    date_start = Column(Date, nullable=False)
    date_end = Column(Date, nullable=False)

    invoices = relationship("Invoice", backref="income_statement")
    number_of_invoices = Column(Integer, nullable=False)
    price_total_invoices = Column(Float, nullable=False)
    price_average_invoices = Column(Float, nullable=False)

    expenses = relationship("Expense", backref="income_statement")
    number_of_expenses = Column(Integer, nullable=False)
    price_total_expenses = Column(Float, nullable=False)
    price_average_expenses = Column(Float, nullable=False)

    # Total Invoices - Total Expenses (the calculation you mentioned earlier)
    profit_gross = Column(Float, nullable=False)
    # (Gross Profit / Total Invoices) * 100, to show the percentage of profit
    profit_margin = Column(Float, nullable=False)
