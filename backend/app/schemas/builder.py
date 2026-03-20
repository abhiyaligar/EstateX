from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID

class BuilderBase(BaseModel):
    company_name: str
    company_registration_number: Optional[str] = None
    rera_registration_number: Optional[str] = None
    headquarters_address: Optional[str] = None
    headquarters_city: Optional[str] = None
    headquarters_state: Optional[str] = None
    headquarters_pincode: Optional[str] = None
    year_established: Optional[int] = None

class BuilderCreate(BuilderBase):
    pass

class BuilderResponse(BuilderBase):
    id: UUID  # Changed to UUID type to automatically serialize the DB UUID object
    rera_approved: bool
    rera_approved_date: Optional[datetime] = None
    total_projects_count: int
    completed_projects_count: int
    ongoing_projects_count: int
    average_rating: float
    total_ratings: int
    default_rate: float
    total_funding_raised: float
    total_construction_cost: float
    verification_status: str
    rejection_reason: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class BuilderVerificationUpdate(BaseModel):
    status: str = Field(..., description="Must be 'approved' or 'rejected'")
    rejection_reason: Optional[str] = None
