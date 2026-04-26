from pydantic import BaseModel, condecimal, Field
from typing import Optional
from datetime import datetime
from uuid import UUID
from app.schemas.project import ProjectListResponse
from app.schemas.analytics import MacroDataResponse, OHLCVResponse

class BrickHoldingResponse(BaseModel):
    id: UUID
    user_id: UUID
    project_id: UUID
    quantity: int
    total_cost_basis: float
    created_at: datetime
    project: Optional[ProjectListResponse] = None
    
    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    project_id: UUID
    order_type: str = Field(..., description="Must be exactly 'buy' or 'sell'")
    execution_type: str = Field("limit", description="'limit' or 'market'")
    price_per_brick: Optional[condecimal(max_digits=18, decimal_places=2, gt=0)] = None # type: ignore
    quantity: int = Field(..., gt=0)

class OrderResponse(BaseModel):
    id: UUID
    project_id: UUID
    user_id: UUID
    order_type: str
    execution_type: str
    price_per_brick: Optional[float] = None
    quantity: int
    unfilled_quantity: int
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class TradeResponse(BaseModel):
    id: UUID
    project_id: UUID
    price: float
    quantity: int
    executed_at: datetime
    
    class Config:
        from_attributes = True

class PublicOrderResponse(BaseModel):
    order_type: str
    execution_type: str = "limit"
    price_per_brick: Optional[float] = None
    unfilled_quantity: int
    created_at: datetime

    class Config:
        from_attributes = True
