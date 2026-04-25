import uuid
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, CheckConstraint, DECIMAL, Date, ForeignKey

Base = declarative_base()

# Default timezone-aware UTC datetime
def utcnow():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        CheckConstraint('wallet_balance >= 0', name='ck_users_wallet_balance_non_negative'),
    )

    # UUID returned by Supabase Auth maps to this primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(20), unique=True, nullable=True)
    password_hash = Column(String(255), nullable=True)
    
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    date_of_birth = Column(Date, nullable=True)
    gender = Column(String(20), nullable=True)
    profile_image_url = Column(String(500), nullable=True)
    
    # KYC & Roles
    kyc_status = Column(String(50), default='pending', index=True)
    kyc_verified_at = Column(DateTime(timezone=True), nullable=True)
    kyc_rejection_reason = Column(String(500), nullable=True)
    
    role = Column(String(50), nullable=False, default='investor', index=True)
    account_type = Column(String(50), nullable=True)
    
    # Settings & Verification
    is_active = Column(Boolean(), default=True)
    email_verified = Column(Boolean(), default=False)
    phone_verified = Column(Boolean(), default=False)
    two_factor_enabled = Column(Boolean(), default=False)
    
    # Wallets Mapped
    wallet_balance = Column(DECIMAL(18, 2), default=0.00, nullable=False)
    wallet_address = Column(String(66), unique=True, nullable=True) # Ex-Blockchain reference
    
    # Preferences
    notification_email = Column(Boolean(), default=True)
    notification_sms = Column(Boolean(), default=False)
    notification_push = Column(Boolean(), default=True)
    language = Column(String(10), default='en')
    timezone = Column(String(50), nullable=True)
    
    # Timestamps & Metadata
    created_at = Column(DateTime(timezone=True), default=utcnow, index=True)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)
    last_login = Column(DateTime(timezone=True), nullable=True)
    ip_address_created = Column(String(50), nullable=True)
    
    # Relationships
    kyc_record = relationship("KYCRecord", back_populates="user", uselist=False, cascade="all, delete-orphan", foreign_keys="[KYCRecord.user_id]")
    builder_profile = relationship("Builder", back_populates="user", uselist=False)
    bank_accounts = relationship("BankAccount", back_populates="user", cascade="all, delete-orphan")


class BankAccount(Base):
    __tablename__ = "bank_accounts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), index=True, nullable=False)
    
    account_number = Column(String(50), nullable=False)
    ifsc_code = Column(String(20), nullable=False)
    account_holder_name = Column(String(100), nullable=True)
    
    is_primary = Column(Boolean(), default=False)
    is_verified = Column(Boolean(), default=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    
    user = relationship("User", back_populates="bank_accounts")
