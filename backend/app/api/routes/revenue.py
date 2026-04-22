from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.middleware.auth import get_admin_user, get_builder_user, get_current_user
from app.services.revenue_service import RevenueService
from app.models.revenue import RentalCycle
from pydantic import BaseModel
from decimal import Decimal
from typing import List

router = APIRouter(prefix="/revenue", tags=["Revenue Distribution"])

class RentalDepositRequest(BaseModel):
    project_id: str
    amount: Decimal
    month: int
    year: int

@router.post("/deposit")
def deposit_rental(data: RentalDepositRequest, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """
    Builder or Admin initiates a monthly rental deposit for a project.
    """
    # Check if user is either admin or builder
    if current_user.role not in ['admin', 'builder']:
        raise HTTPException(status_code=403, detail="Only admins or builders can initiate deposits")
        
    return RevenueService.initiate_rental_cycle(db, data.project_id, data.amount, data.month, data.year)

@router.get("/admin/pending")
def get_pending_settlements(db: Session = Depends(get_db), admin = Depends(get_admin_user)):
    """
    Admin fetches all rental cycles awaiting approval.
    """
    return db.query(RentalCycle).filter(RentalCycle.status == 'pending_approval').all()

@router.post("/admin/settle/{cycle_id}")
def settle_cycle(cycle_id: str, db: Session = Depends(get_db), admin = Depends(get_admin_user)):
    """
    Admin approves and executes the pro-rata distribution.
    """
    return RevenueService.settle_revenue_cycle(db, cycle_id, str(admin.id))

@router.delete("/admin/reject/{cycle_id}")
def reject_cycle(cycle_id: str, db: Session = Depends(get_db), admin = Depends(get_admin_user)):
    """
    Admin rejects a rental cycle (e.g. if amount is incorrect).
    """
    cycle = db.query(RentalCycle).filter(RentalCycle.id == cycle_id).first()
    if not cycle:
        raise HTTPException(status_code=404, detail="Cycle not found")
    if cycle.status == 'settled':
        raise HTTPException(status_code=400, detail="Cannot reject a settled cycle")
        
    db.delete(cycle)
    db.commit()
    return {"message": "Cycle rejected and removed"}

@router.get("/history/{project_id}")
def get_project_revenue_history(project_id: str, db: Session = Depends(get_db)):
    """
    Publicly view history of distributions for a project.
    """
    return db.query(RentalCycle).filter(RentalCycle.project_id == project_id, RentalCycle.status == 'settled').order_by(RentalCycle.distributed_at.desc()).all()
