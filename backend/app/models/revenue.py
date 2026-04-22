import uuid
from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, DECIMAL
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.user import Base
import datetime

class RentalCycle(Base):
    """
    Tracks a monthly rental distribution event for a project.
    """
    __tablename__ = 'rental_cycles'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    project_id = Column(UUID(as_uuid=True), ForeignKey('projects.id', ondelete='CASCADE'), nullable=False, index=True)
    
    month = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)
    
    gross_amount = Column(DECIMAL(18, 2), nullable=False)
    fee_amount = Column(DECIMAL(18, 2), nullable=False) # 1% Platform Fee
    net_amount = Column(DECIMAL(18, 2), nullable=False) # 99% Distributed
    
    status = Column(String(50), default='pending_approval', index=True) # pending_approval, settled, failed
    admin_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    distributed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    project = relationship("Project")
    payouts = relationship("RentalPayout", back_populates="cycle", cascade="all, delete-orphan")

class RentalPayout(Base):
    """
    Tracks individual payout to each investor within a cycle.
    """
    __tablename__ = 'rental_payouts'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    cycle_id = Column(UUID(as_uuid=True), ForeignKey('rental_cycles.id', ondelete='CASCADE'), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    
    eligible_quantity = Column(Integer, nullable=False) # Bricks held >30 days
    amount_paid = Column(DECIMAL(18, 2), nullable=False)
    
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)

    # Relationships
    cycle = relationship("RentalCycle", back_populates="payouts")
    user = relationship("User")
