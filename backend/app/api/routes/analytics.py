from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random

from app.schemas.auth import User
from app.schemas.exchange import MacroDataResponse
from app.middleware.auth import get_current_user
from app.core.db import get_db

router = APIRouter(prefix="/analytics", tags=["Advanced Analytics"])

@router.get("/macro/{pincode}", response_model=MacroDataResponse)
def get_macroeconomic_data(
    pincode: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mock endpoint for macroeconomic real estate data.
    Designed to be easily scaled to a real-world API provider (e.g. MagicBricks/99acres/Housing API) in the future.
    """
    # Simulate API latency or DB lookup
    
    # Generate deterministic mock data based on the pincode string
    seed = sum([ord(c) for c in pincode])
    random.seed(seed)
    
    yoy_growth = round(random.uniform(2.5, 15.0), 2)
    avg_rental_yield = round(random.uniform(4.0, 9.5), 2)
    demand_score = random.randint(40, 95)
    
    return MacroDataResponse(
        pincode=pincode,
        yoy_growth_percentage=yoy_growth,
        avg_rental_yield=avg_rental_yield,
        demand_score=demand_score,
        last_updated=datetime.utcnow() - timedelta(days=random.randint(1, 5))
    )
