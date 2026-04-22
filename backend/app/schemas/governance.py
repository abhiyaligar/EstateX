from pydantic import BaseModel, Field
from typing import List, Optional, Any
from datetime import datetime
from uuid import UUID

class ProposalBase(BaseModel):
    title: str
    description: str
    options: List[str]
    end_date: datetime

class ProposalCreate(ProposalBase):
    project_id: UUID

class ProposalResponse(ProposalBase):
    id: UUID
    project_id: UUID
    status: str
    created_at: datetime
    updated_at: datetime
    result_option_index: Optional[int] = None
    total_votes: int = 0
    vote_distribution: List[int] = [] # Index matched with options

    class Config:
        from_attributes = True

class VoteCreate(BaseModel):
    option_index: int

class VoteResponse(BaseModel):
    id: UUID
    proposal_id: UUID
    user_id: UUID
    option_index: int
    weight: int
    created_at: datetime

    class Config:
        from_attributes = True
