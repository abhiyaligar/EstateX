import uuid
from sqlalchemy import Column, String, Float, Integer, ForeignKey, DateTime, DECIMAL
from sqlalchemy.dialects.postgresql import UUID
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
    
    # Financials
    total_budget = Column(DECIMAL(18, 2), nullable=False)
    funding_target = Column(DECIMAL(18, 2), nullable=False)
    funding_raised = Column(DECIMAL(18, 2), default=0.00)
    
    # Status & Compliance
    status = Column(String(50), default='draft', index=True) # draft, active, funded, completed, stalled
    rera_id = Column(String(100), unique=True)
    expected_completion_date = Column(DateTime)
    
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
