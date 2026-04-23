from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class MacroDataResponse(BaseModel):
    pincode: str
    yoy_growth_percentage: float
    avg_rental_yield: float
    demand_score: int
    last_updated: datetime

    class Config:
        from_attributes = True

class MacroAnalyticsCreate(BaseModel):
    pincode: str
    yoy_growth_percentage: float
    avg_rental_yield: float
    demand_score: int

class MacroAnalyticsUpdate(BaseModel):
    yoy_growth_percentage: Optional[float] = None
    avg_rental_yield: Optional[float] = None
    demand_score: Optional[int] = None

class OHLCVResponse(BaseModel):
    time: int # Unix timestamp for charting libraries
    open: float
    high: float
    low: float
    close: float
    value: float # Volume traded
