from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime
from uuid import UUID

class DashboardStatsResponse(BaseModel):
    total_users: int
    total_investors: int
    total_builders: int
    total_admins: int
    kyc_pending_approvals: int
    # Note: These values will remain simulated until we build the Investment/Project schemas
    total_investments_locked_inr: int = 250000000
    projects_active: int = 12
    projects_completed: int = 3

class KYCReviewRequest(BaseModel):
    status: Literal['approved', 'rejected']
    rejection_reason: Optional[str] = None

class AdminKYCRecordBase(BaseModel):
    id: UUID
    user_id: UUID
    status: str
    aadhaar_last_4_digits: Optional[str]
    pan_number: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class KYCReviewResponse(BaseModel):
    success: bool
    message: str
    kyc_status: str

class AdminMilestoneReviewRequest(BaseModel):
    status: str = Field(..., description="Must be 'completed' or 'in_progress'")

class AdminProjectStatusUpdateRequest(BaseModel):
    status: str = Field(..., description="Must be 'stalled', 'cancelled', or 'active'")
