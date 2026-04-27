from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Enum
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.models.user import Base, utcnow
from sqlalchemy.orm import relationship

class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    
    subject = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50), nullable=False) # technical, financial, account, property
    
    status = Column(String(20), default='open', index=True) # open, in_progress, resolved, closed
    priority = Column(String(20), default='medium') # low, medium, high
    
    admin_notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    # Relationships
    user = relationship("User", back_populates="support_tickets")
