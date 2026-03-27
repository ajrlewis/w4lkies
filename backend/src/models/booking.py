from sqlalchemy import Boolean, Column, Date, Time, ForeignKey, Integer
from sqlalchemy.orm import relationship

from database import Base
from models.timestamp_mixin import TimestampMixin


class Booking(TimestampMixin, Base):
    __tablename__ = "booking"

    booking_id = Column(Integer, primary_key=True, autoincrement=True)

    date = Column(Date, nullable=False)
    time = Column(Time, nullable=False)

    customer_id = Column(Integer, ForeignKey("customer.customer_id"), nullable=False)
    customer = relationship("Customer", backref="booking")

    service_id = Column(Integer, ForeignKey("service.service_id"), nullable=False)
    service = relationship("Service", backref="booking")

    invoice_id = Column(Integer, ForeignKey("invoice.invoice_id"), nullable=True)

    user_id = Column(Integer, ForeignKey("user.user_id"), nullable=True)
    user = relationship("User", backref="booking", foreign_keys=[user_id])
