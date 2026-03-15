import uuid
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy import Column, String, Boolean, DateTime, CheckConstraint, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timezone
from app.models.user import Base, utcnow

class KYCRecord(Base):
    __tablename__ = "kyc_records"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False, index=True)
    
    # Aadhaar Details
    aadhaar_hash = Column(String(256), nullable=True)
    aadhaar_last_4_digits = Column(String(4), nullable=True)
    aadhaar_verified = Column(Boolean, default=False)
    aadhaar_verified_at = Column(DateTime(timezone=True), nullable=True)
    
    # PAN Details
    pan_number = Column(String(20), unique=True, nullable=True, index=True)
    pan_verified = Column(Boolean, default=False)
    pan_verified_at = Column(DateTime(timezone=True), nullable=True)
    
    # Verification process details
    otp_sent_count = Column(Integer, default=0)
    otp_verified_count = Column(Integer, default=0)
    session_id = Column(String(100), nullable=True)
    
    # Status
    status = Column(String(50), default='pending', index=True) # pending, otp_sent, otp_verified, approved, rejected
    rejection_reason = Column(String(500), nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    # Relationship back to user
    user = relationship("User", back_populates="kyc_record")
