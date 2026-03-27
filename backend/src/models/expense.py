from sqlalchemy import Boolean, Column, Date, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from database import Base
from models.timestamp_mixin import TimestampMixin


class Expense(TimestampMixin, Base):
    __tablename__ = "expense"

    expense_id = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(Date, nullable=False)
    price = Column(Float, nullable=False)
    description = Column(String(255), nullable=True)
    category = Column(String(255), nullable=True)
