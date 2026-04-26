from pydantic import BaseModel, Field
from typing import Optional, Literal, List
from datetime import datetime
from uuid import UUID

class DashboardStatsResponse(BaseModel):
    total_users: int
    total_investors: int
    total_builders: int
    total_admins: int
    kyc_pending_approvals: int
    builder_pending_approvals: int
    total_investments_locked_inr: float
    projects_active: int
    projects_completed: int
    total_platform_escrow: float
    growth_history: List[dict] = []

class KYCReviewRequest(BaseModel):
    status: Literal['approved', 'rejected']
    rejection_reason: Optional[str] = None

class AdminKYCRecordBase(BaseModel):
    id: UUID
    user_id: UUID
    full_name: Optional[str] = None
    status: str
    aadhaar_last_4_digits: Optional[str]
    pan_number: Optional[str] = None
    assigned_admin_id: Optional[UUID] = None
    reviewed_by_id: Optional[UUID] = None
    reviewed_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    pan_image_url: Optional[str] = None
    aadhaar_front_url: Optional[str] = None
    aadhaar_back_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class KYCListResponse(BaseModel):
    items: List[AdminKYCRecordBase]
    total: int
    skip: int
    limit: int

class KYCReviewResponse(BaseModel):
    success: bool
    message: str
    kyc_status: str

class AdminMilestoneReviewRequest(BaseModel):
    status: str = Field(..., description="Must be 'completed' or 'in_progress'")

class AdminProjectStatusUpdateRequest(BaseModel):
    status: str = Field(..., description="Must be 'stalled', 'cancelled', or 'active'")
