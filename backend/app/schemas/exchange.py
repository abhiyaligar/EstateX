from pydantic import BaseModel, condecimal, Field
from typing import Optional
from datetime import datetime
from uuid import UUID

class BrickHoldingResponse(BaseModel):
    id: UUID
    user_id: UUID
    project_id: UUID
    quantity: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    project_id: UUID
    order_type: str = Field(..., description="Must be exactly 'buy' or 'sell'")
    price_per_brick: condecimal(max_digits=18, decimal_places=2, gt=0) # type: ignore
    quantity: int = Field(..., gt=0)

class OrderResponse(BaseModel):
    id: UUID
    project_id: UUID
    user_id: UUID
    order_type: str
    price_per_brick: float
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
