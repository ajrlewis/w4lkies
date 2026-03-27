from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer


class TimestampMixin:
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    created_by = Column(Integer, ForeignKey("user.user_id"), nullable=False)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )
    updated_by = Column(Integer, ForeignKey("user.user_id"), nullable=False)
