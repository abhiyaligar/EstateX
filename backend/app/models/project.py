import uuid
from sqlalchemy import Column, String, Float, Integer, ForeignKey, DateTime, DECIMAL, Boolean, Date
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.models.user import Base
import datetime

class Project(Base):
    __tablename__ = 'projects'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    builder_id = Column(UUID(as_uuid=True), ForeignKey('builders.id', ondelete='CASCADE'), nullable=False)
    
    title = Column(String(255), nullable=False)
    description = Column(String)
    
    # Location
    location_address = Column(String, nullable=False)
    city = Column(String(100), nullable=False, index=True)
    state = Column(String(100), nullable=False)
    pincode = Column(String(10), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    # Financials (Stock Broker Model)
    total_budget = Column(DECIMAL(18, 2), nullable=False) # Only for Builder reference
    funding_raised = Column(DECIMAL(18, 2), default=0.00) # Realtime tracking of actual IPO sales
    
    # Brick Metrics
    total_bricks = Column(Integer, nullable=False)
    face_value = Column(DECIMAL(18, 2), nullable=False)
    ipo_price = Column(DECIMAL(18, 2), nullable=False)
    market_value = Column(DECIMAL(18, 2)) # Latest matched trade price. Defaults directly to ipo_price on IPO completion.
    previous_close_price = Column(DECIMAL(18, 2)) # Captures previous day's close for Circuit Breaker (+20% / -10%) logic
    
    # Status & Compliance
    ipo_status = Column(String(50), default='upcoming', index=True) # upcoming, active, completed
    status = Column(String(50), default='draft', index=True) # draft, approved, halted, cancelled
    rera_id = Column(String(100), unique=True)
    rera_approved = Column(Boolean(), default=False)
    environmental_clearance = Column(Boolean(), default=False)
    insurance_coverage = Column(Boolean(), default=False)
    
    # Timeline
    launch_date = Column(Date, nullable=True)
    construction_start_date = Column(Date, nullable=True)
    expected_completion_date = Column(DateTime)
    
    # Media & Documents
    rera_approval_url = Column(String(500), nullable=True)
    brochure_url = Column(String(500), nullable=True)
    floor_plans = Column(JSONB, default=list) # Array of Image URLs
    images = Column(JSONB, default=list) # Array of Image URLs
    
    # Arbitrary Legacy Financials
    funding_target = Column(DECIMAL(18, 2), nullable=True)
    min_investment = Column(DECIMAL(18, 2), nullable=True)
    
    # Metrics
    investor_count = Column(Integer, default=0)
    view_count = Column(Integer, default=0)
    
    # Blockchain / Tokenization
    token_address = Column(String(66), unique=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    builder = relationship("Builder", back_populates="projects")
    milestones = relationship("Milestone", back_populates="project", cascade="all, delete-orphan")


class Milestone(Base):
    __tablename__ = 'milestones'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    project_id = Column(UUID(as_uuid=True), ForeignKey('projects.id', ondelete='CASCADE'), nullable=False)
    
    milestone_number = Column(Integer, nullable=False)
    description = Column(String(500), nullable=False)
    target_date = Column(DateTime)
    release_percentage = Column(Float, nullable=False)
    status = Column(String(50), default='pending') # pending, in_progress, completed
    
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="milestones")
