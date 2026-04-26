import uuid
from sqlalchemy import Column, Integer, ForeignKey, DateTime, Numeric, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.user import Base
import datetime

class BrickHolding(Base):
    """
    Legally maps fractional ownership. Investors own integer quantities of 'Bricks' representing equity in a specific Real Estate Project.
    """
    __tablename__ = 'brick_holdings'
    __table_args__ = (
        UniqueConstraint('user_id', 'project_id', name='uq_user_project_holding'),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    project_id = Column(UUID(as_uuid=True), ForeignKey('projects.id', ondelete='CASCADE'), nullable=False, index=True)
    
    quantity = Column(Integer, nullable=False, default=0) # Must never strictly drop below 0
    total_cost_basis = Column(Numeric(precision=20, scale=2), nullable=False, default=0) # Total INR spent to acquire these bricks
    
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    project = relationship("Project")

    # Note: For massive scalability, we forgo back_populates on the master User model since it heavily buffers relational cache.
