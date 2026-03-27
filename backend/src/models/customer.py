from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declared_attr

from database import Base
from models.timestamp_mixin import TimestampMixin


class Customer(TimestampMixin, Base):
    __tablename__ = "customer"

    customer_id = Column(Integer, primary_key=True)
    name = Column(String)
    phone = Column(String)
    email = Column(String)
    emergency_contact_name = Column(String)
    emergency_contact_phone = Column(String)
    signed_up_on = Column(DateTime)
    is_active = Column(Boolean)

    # dogs = relationship("Dog", backref="customers")
    dogs = relationship("Dog", backref="customer")
