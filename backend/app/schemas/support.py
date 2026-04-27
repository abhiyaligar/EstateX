from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class SupportTicketCreate(BaseModel):
    subject: str = Field(..., max_length=200)
    description: str
    category: str = Field(..., description="technical, financial, account, property")

class SupportTicketUpdate(BaseModel):
    status: Optional[str] = None # open, in_progress, resolved, closed
    priority: Optional[str] = None # low, medium, high
    admin_notes: Optional[str] = None

class SupportTicketResponse(BaseModel):
    id: UUID
    user_id: UUID
    user_email: Optional[str] = None
    user_name: Optional[str] = None
    subject: str
    description: str
    category: str
    status: str
    priority: str
    admin_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class SupportTicketListResponse(BaseModel):
    items: List[SupportTicketResponse]
    total: int
