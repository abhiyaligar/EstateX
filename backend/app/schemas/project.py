from pydantic import BaseModel, Field, model_validator
from typing import List, Optional, Any
from datetime import datetime, date, timezone
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
    
    total_bricks: int = Field(..., gt=0)
    face_value: float = Field(..., gt=0)
    ipo_price: float = Field(..., gt=0)
    
    rera_id: Optional[str] = None
    rera_approved: bool = False
    environmental_clearance: bool = False
    insurance_coverage: bool = False
    
    rera_approval_url: Optional[str] = None
    brochure_url: Optional[str] = None
    
    expected_completion_date: Optional[datetime] = None

class ProjectCreate(ProjectBase):
    milestones: List[MilestoneCreate] = Field(..., min_length=1)

class ProjectBuilderResponse(BaseModel):
    id: UUID
    company_name: str
    headquarters_city: Optional[str]
    average_rating: float
    total_projects: int

class ProjectLocationResponse(BaseModel):
    address: str
    city: str
    state: str
    pincode: str
    latitude: Optional[float]
    longitude: Optional[float]

class ProjectFinancialResponse(BaseModel):
    total_budget: float
    funding_target: Optional[float]
    funding_raised: float
    min_investment: Optional[float]
    total_bricks: int
    face_value: float
    ipo_price: float
    market_value: Optional[float]
    previous_close_price: Optional[float]
    total_escrow_held: float # Funds in admin control

class ProjectTimelineResponse(BaseModel):
    launch_date: Optional[date]
    construction_start: Optional[date]
    expected_completion: Optional[datetime]
    months_remaining: Optional[int]

class ProjectDocumentsResponse(BaseModel):
    rera_approval: Optional[str]
    brochure: Optional[str]
    floor_plans: List[str]

class ProjectComplianceResponse(BaseModel):
    rera_approved: bool
    environmental_clearance: bool
    insurance_coverage: bool

class ProjectListResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    builder: Optional[ProjectBuilderResponse]
    location: ProjectLocationResponse
    financial: ProjectFinancialResponse
    timeline: ProjectTimelineResponse
    documents: ProjectDocumentsResponse
    compliance: ProjectComplianceResponse
    images: List[str]
    investor_count: int
    view_count: int
    ipo_status: str
    status: str
    created_at: datetime
    
    @model_validator(mode='before')
    @classmethod
    def assemble_nested(cls, v: Any):
        if isinstance(v, dict):
            return v
            
        def get_attr(attr, default=None):
            val = getattr(v, attr, None)
            return val if val is not None else default
            
        b = get_attr("builder")
        builder_data = None
        if b:
            builder_data = {
                "id": b.id,
                "company_name": getattr(b, "company_name", ""),
                "headquarters_city": getattr(b, "headquarters_city", None),
                "average_rating": getattr(b, "average_rating", 0.0),
                "total_projects": getattr(b, "total_projects_count", 0)
            }
            
        months_remaining = None
        comp_date = get_attr("expected_completion_date")
        if comp_date:
            now = datetime.now(timezone.utc)
            if comp_date.tzinfo is None:
                now = now.replace(tzinfo=None)
            delta = comp_date - now
            months_remaining = max(0, int(delta.days / 30))
            
        return {
            "id": v.id,
            "title": v.title,
            "description": v.description,
            "builder": builder_data,
            "location": {
                "address": get_attr("location_address", ""),
                "city": get_attr("city", ""),
                "state": get_attr("state", ""),
                "pincode": get_attr("pincode", ""),
                "latitude": get_attr("latitude"),
                "longitude": get_attr("longitude")
            },
            "financial": {
                "total_budget": get_attr("total_budget", 0),
                "funding_target": get_attr("funding_target"),
                "funding_raised": get_attr("funding_raised", 0),
                "min_investment": get_attr("min_investment"),
                "total_bricks": get_attr("total_bricks", 0),
                "face_value": get_attr("face_value", 0),
                "ipo_price": get_attr("ipo_price", 0),
                "market_value": get_attr("market_value"),
                "previous_close_price": get_attr("previous_close_price"),
                "total_escrow_held": get_attr("total_escrow_held", 0)
            },
            "timeline": {
                "launch_date": get_attr("launch_date"),
                "construction_start": get_attr("construction_start_date"),
                "expected_completion": comp_date,
                "months_remaining": months_remaining
            },
            "documents": {
                "rera_approval": get_attr("rera_approval_url"),
                "brochure": get_attr("brochure_url"),
                "floor_plans": get_attr("floor_plans", []) or []
            },
            "compliance": {
                "rera_approved": get_attr("rera_approved", False),
                "environmental_clearance": get_attr("environmental_clearance", False),
                "insurance_coverage": get_attr("insurance_coverage", False)
            },
            "images": get_attr("images", []) or [],
            "investor_count": get_attr("investor_count", 0),
            "view_count": get_attr("view_count", 0),
            "ipo_status": get_attr("ipo_status", "upcoming"),
            "status": get_attr("status", "draft"),
            "created_at": get_attr("created_at")
        }

    class Config:
        from_attributes = True

class ProjectDetailResponse(ProjectListResponse):
    milestones: List[MilestoneResponse]
    
    @model_validator(mode='before')
    @classmethod
    def assemble_nested_details(cls, v: Any):
        if isinstance(v, dict):
            return v
        base = ProjectListResponse.assemble_nested(v)
        base["milestones"] = getattr(v, "milestones", [])
        return base
