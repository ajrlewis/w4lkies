from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from database import Base
from models.timestamp_mixin import TimestampMixin


class Service(TimestampMixin, Base):
    __tablename__ = "service"

    service_id = Column(Integer, primary_key=True, autoincrement=True)

    name = Column(String(255), nullable=False)
    price = Column(Float, nullable=False)
    description = Column(String(500), default="", nullable=False)
    duration = Column(Float, nullable=True)
    is_publicly_offered = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
