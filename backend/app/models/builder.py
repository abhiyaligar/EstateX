from sqlalchemy import Column, String, Boolean, DateTime, Float, Integer, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.models.user import Base
import datetime

class Builder(Base):
    __tablename__ = 'builders'

    # The Primary Key is also a Foreign Key pointing to users.id (1:1 relationship)
    id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), primary_key=True, index=True)
    
    company_name = Column(String(255), nullable=False)
    company_registration_number = Column(String(100), unique=True)
    rera_registration_number = Column(String(100), unique=True)
    rera_approved = Column(Boolean, default=False)
    rera_approved_date = Column(DateTime(timezone=True))
    
    # Contact Info
    headquarters_address = Column(String)
    headquarters_city = Column(String(100))
    headquarters_state = Column(String(100))
    headquarters_pincode = Column(String(10))
    
    # Company Details
    year_established = Column(Integer)
    total_projects_count = Column(Integer, default=0)
    completed_projects_count = Column(Integer, default=0)
    ongoing_projects_count = Column(Integer, default=0)
    
    # Reputation
    average_rating = Column(Float, default=0.0)
    total_ratings = Column(Integer, default=0)
    default_rate = Column(Float, default=0.0)
    
    # Financial
    total_funding_raised = Column(Float, default=0.0)
    total_construction_cost = Column(Float, default=0.0)
    
    # Verification System
    document_verified = Column(Boolean, default=False)
    documents_verified_date = Column(DateTime(timezone=True))
    verification_status = Column(String(50), default='pending') # pending, approved, rejected
    rejection_reason = Column(String(500))
    
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="builder_profile")
    projects = relationship("Project", back_populates="builder", cascade="all, delete-orphan")
