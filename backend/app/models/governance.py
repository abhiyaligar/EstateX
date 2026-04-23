import uuid
from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.models.user import Base, utcnow
import datetime

class GovernanceProposal(Base):
    __tablename__ = 'governance_proposals'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    project_id = Column(UUID(as_uuid=True), ForeignKey('projects.id', ondelete='CASCADE'), nullable=False, index=True)
    
    title = Column(String(255), nullable=False)
    description = Column(String, nullable=False)
    options = Column(JSONB, nullable=False) # e.g. ["Yes", "No"] or ["Renew", "Change", "Sell"]
    
    status = Column(String(50), default='active', index=True) # active, closed, executed
    
    end_date = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)
    
    result_option_index = Column(Integer, nullable=True) # Set when closed

    # Relationships
    project = relationship("Project")
    votes = relationship("ProposalVote", back_populates="proposal", cascade="all, delete-orphan")


class ProposalVote(Base):
    __tablename__ = 'proposal_votes'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    proposal_id = Column(UUID(as_uuid=True), ForeignKey('governance_proposals.id', ondelete='CASCADE'), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    
    option_index = Column(Integer, nullable=False)
    weight = Column(Integer, nullable=False) # Snapshot of bricks held at time of vote (or proposal creation)
    
    created_at = Column(DateTime(timezone=True), default=utcnow)

    # Relationships
    proposal = relationship("GovernanceProposal", back_populates="votes")
    user = relationship("User")
