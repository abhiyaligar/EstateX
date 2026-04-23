import uuid
from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.user import Base
import datetime

class BrickHolding(Base):
    """
    Legally maps fractional ownership. Investors own integer quantities of 'Bricks' representing equity in a specific Real Estate Project.
    """
    __tablename__ = 'brick_holdings'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    project_id = Column(UUID(as_uuid=True), ForeignKey('projects.id', ondelete='CASCADE'), nullable=False, index=True)
    
    quantity = Column(Integer, nullable=False, default=0) # Must never strictly drop below 0
    
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    project = relationship("Project")

    # Note: For massive scalability, we forgo back_populates on the master User model since it heavily buffers relational cache.
