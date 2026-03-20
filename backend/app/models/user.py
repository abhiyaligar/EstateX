import uuid
from sqlalchemy.orm import declarative_base, relationship

from sqlalchemy import Column, String, Boolean, DateTime, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timezone

Base = declarative_base()

# Default timezone-aware UTC datetime
def utcnow():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    # UUID returned by Supabase Auth maps to this primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(20), unique=True, nullable=True)
    
    # Store Supabase User ID or an encrypted password block if needed
    # For now, we omit password_hash since Supabase handles the actual credentials, 
    # but the schema asks for it. We'll set it nullable.
    password_hash = Column(String(255), nullable=True)
    
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    
    # KYC & Roles
    kyc_status = Column(String(50), default='pending', index=True)
    role = Column(String(50), nullable=False, default='investor', index=True)
    
    # Settings
    is_active = Column(Boolean(), default=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, index=True)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)
    
    # Relationships
    kyc_record = relationship("KYCRecord", back_populates="user", uselist=False, cascade="all, delete-orphan")
    builder_profile = relationship("Builder", back_populates="user", uselist=False)
