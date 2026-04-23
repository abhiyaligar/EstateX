from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.schemas.auth import User
from app.schemas.analytics import MacroDataResponse
from app.middleware.auth import get_current_user
from app.core.db import get_db
from app.models.analytics import MacroAnalytics

router = APIRouter(prefix="/analytics", tags=["Advanced Analytics"])

@router.get("/macro/{pincode}", response_model=MacroDataResponse)
def get_macroeconomic_data(
    pincode: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Fetch macroeconomic real estate data for a specific pincode from the database.
    Returns 404 if no data is available for the given pincode.
    """
    macro_data = db.query(MacroAnalytics).filter(MacroAnalytics.pincode == pincode).first()
    
    if not macro_data:
        raise HTTPException(
            status_code=404, 
            detail=f"No macroeconomic data available for pincode {pincode}"
        )
    
    return MacroDataResponse(
        pincode=macro_data.pincode,
        yoy_growth_percentage=macro_data.yoy_growth_percentage,
        avg_rental_yield=macro_data.avg_rental_yield,
        demand_score=macro_data.demand_score,
        last_updated=macro_data.last_updated
    )
