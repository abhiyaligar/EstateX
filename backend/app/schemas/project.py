from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from uuid import UUID

class MilestoneBase(BaseModel):
    milestone_number: int
    description: str
    target_date: Optional[datetime] = None
    release_percentage: float = Field(..., gt=0, le=100)

class MilestoneCreate(MilestoneBase):
    pass

class MilestoneResponse(MilestoneBase):
    id: UUID
    project_id: UUID
    status: str
    
    class Config:
        from_attributes = True

class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None
    location_address: str
    city: str
    state: str
    pincode: str
    total_budget: float
    funding_target: float
    rera_id: Optional[str] = None
    expected_completion_date: Optional[datetime] = None

class ProjectCreate(ProjectBase):
    milestones: List[MilestoneCreate] = Field(..., min_length=1)

class ProjectListResponse(ProjectBase):
    id: UUID
    builder_id: UUID
    funding_raised: float
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class ProjectDetailResponse(ProjectListResponse):
    milestones: List[MilestoneResponse]
    
    class Config:
        from_attributes = True
