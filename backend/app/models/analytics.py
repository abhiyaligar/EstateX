import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, DateTime
from sqlalchemy.dialects.postgresql import UUID

from app.models.user import Base # Assuming Base is defined here or imported via user.py

class MacroAnalytics(Base):
    __tablename__ = "macro_analytics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pincode = Column(String, unique=True, index=True, nullable=False)
    yoy_growth_percentage = Column(Float, nullable=False)
    avg_rental_yield = Column(Float, nullable=False)
    demand_score = Column(Integer, nullable=False)
    last_updated = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
