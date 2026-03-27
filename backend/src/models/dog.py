from sqlalchemy import Boolean, Column, Date, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declared_attr

from database import Base
from models.timestamp_mixin import TimestampMixin


class Dog(TimestampMixin, Base):
    __tablename__ = "dog"

    dog_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    date_of_birth = Column(Date, nullable=True)
    is_allowed_treats = Column(Boolean, nullable=False)
    is_allowed_off_the_lead = Column(Boolean, nullable=False)
    is_allowed_on_social_media = Column(Boolean, nullable=False)
    is_neutered_or_spayed = Column(Boolean, nullable=False)
    behavioral_issues = Column(String(6000), nullable=False, default="")
    medical_needs = Column(String(6000), nullable=False, default="")
    breed = Column(String(255), nullable=True)

    customer_id = Column(Integer, ForeignKey("customer.customer_id"), nullable=False)

    vet_id = Column(Integer, ForeignKey("vet.vet_id"), nullable=False)
