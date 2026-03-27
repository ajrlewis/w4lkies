from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from database import Base
from models.timestamp_mixin import TimestampMixin


class User(TimestampMixin, Base):
    __tablename__ = "user"

    user_id = Column(Integer, primary_key=True)
    name = Column(String)
    email = Column(String)
    password_hash = Column(String)
    is_admin = Column(Boolean, default=False)
    is_active = Column(Boolean, default=False)

    @property
    def username(self) -> str:
        return self.name
