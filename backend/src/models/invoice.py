from sqlalchemy import Boolean, Column, Date, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from database import Base
from models.timestamp_mixin import TimestampMixin


class Invoice(TimestampMixin, Base):
    __tablename__ = "invoice"

    invoice_id = Column(Integer, primary_key=True)

    date_start = Column(Date, nullable=False)
    date_end = Column(Date, nullable=False)
    date_issued = Column(Date, nullable=False)
    date_due = Column(Date, nullable=True)
    date_paid = Column(Date, nullable=True)

    price_subtotal = Column(Float, nullable=False)
    price_discount = Column(Float, nullable=False)
    price_total = Column(Float, nullable=False)

    bookings = relationship("Booking", backref="invoice")

    customer_id = Column(Integer, ForeignKey("customer.customer_id"), nullable=True)
    customer = relationship("Customer", backref="invoice")

    reference = Column(String(255), nullable=False)
