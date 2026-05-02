from sqlalchemy import Column, String, DateTime, Boolean, JSON
from sqlalchemy.dialects.postgresql import UUID
from app.models.user import Base
import uuid
import datetime

class OTPRecord(Base):
    __tablename__ = 'otps'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    email = Column(String(255), index=True, nullable=False)
    otp_code = Column(String(10), nullable=False)
    purpose = Column(String(50), nullable=False, default="forgot_password")
    payload = Column(JSON, nullable=True) # Used to store temporary data like withdrawal amount
    expires_at = Column(DateTime(timezone=True), nullable=False)
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
