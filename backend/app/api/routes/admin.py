from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from app.schemas.auth import User
from app.schemas.admin import (
    DashboardStatsResponse, KYCReviewRequest, AdminKYCRecordBase, KYCReviewResponse,
    AdminMilestoneReviewRequest, AdminProjectStatusUpdateRequest, KYCListResponse
)
from app.schemas.builder import BuilderVerificationUpdate, BuilderResponse
from app.schemas.wallet import AdminWalletAdjustmentRequest
from app.middleware.auth import get_admin_user
from app.services.admin_service import AdminService
from app.services.builder_service import BuilderService
from app.services.wallet_service import WalletService
from app.core.db import get_db
from app.models.analytics import MacroAnalytics
from app.schemas.analytics import MacroDataResponse, MacroAnalyticsCreate, MacroAnalyticsUpdate

router = APIRouter(prefix="/admin", tags=["Admin Portal"])

@router.get("/dashboard-stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    return AdminService.get_dashboard_stats(db)

@router.get("/kyc-applications", response_model=KYCListResponse)
def list_kyc_applications(
    status: str = 'all',
    assigned_admin_id: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    return AdminService.get_kyc_applications(
        db, status_filter=status, assigned_admin_id=assigned_admin_id, skip=skip, limit=limit
    )

@router.post("/kyc-applications/{kyc_id}/claim")
def claim_kyc_application(
    kyc_id: UUID,
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    return AdminService.claim_kyc_application(str(kyc_id), str(current_admin.id), db)

@router.post("/kyc-applications/{kyc_id}/release")
def release_kyc_application(
    kyc_id: UUID,
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    return AdminService.release_kyc_application(str(kyc_id), str(current_admin.id), db)

@router.post("/kyc-applications/{kyc_id}/review", response_model=KYCReviewResponse)
def review_kyc_application(
    kyc_id: UUID,
    review_data: KYCReviewRequest,
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    return AdminService.review_kyc_application(str(kyc_id), str(current_admin.id), review_data, db)

@router.post("/builders/{builder_id}/verify", response_model=BuilderResponse)
def verify_builder_profile(
    builder_id: UUID,
    verification_data: BuilderVerificationUpdate,
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    return BuilderService.verify_builder(str(builder_id), verification_data, db)

@router.get("/builders/pending", response_model=List[BuilderResponse])
def list_pending_builders(
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Returns a list of all Builder profiles currently in 'pending' status awaiting verification.
    """
    return BuilderService.get_pending_builders(db)

@router.post("/projects/{project_id}/milestones/{milestone_id}/verify")
def verify_project_milestone(
    project_id: UUID,
    milestone_id: UUID,
    review_data: AdminMilestoneReviewRequest,
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Officially marks a project's construction milestone as 'completed', allowing escrow releases.
    """
    return AdminService.verify_project_milestone(str(project_id), str(milestone_id), review_data, db)

@router.post("/projects/{project_id}/status")
def update_project_status(
    project_id: UUID,
    status_data: AdminProjectStatusUpdateRequest,
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Emergency control: Forcefully halts or restarts an active project to protect investors.
    """
    return AdminService.update_project_status(str(project_id), status_data, db)

@router.post("/users/{target_user_id}/wallet/adjust")
def admin_adjust_user_wallet(
    target_user_id: str,
    adjust_data: AdminWalletAdjustmentRequest,
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    God Mode: Directly increase or decrease an arbitrary User's wallet balance (e.g., resolving disputes or manual bank wires).
    """
    return WalletService.admin_adjust_balance(target_user_id, adjust_data, db)

from app.models.project import Project
from fastapi import HTTPException, status

@router.post("/projects/{project_id}/approve_ipo")
def approve_project_ipo(
    project_id: str,
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Officially launches a Builder's Project IPO, allowing Investors to begin Subscribing and purchasing Bricks.
    """
    project = db.query(Project).filter(Project.id == project_id).with_for_update().first()
    if not project or project.ipo_status != 'upcoming':
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Project IPO must be 'upcoming'.")
        
    project.ipo_status = 'active'
    db.commit()
    return {"success": True, "message": "Project IPO is now completely active! Investors can begin subscribing."}

@router.post("/projects/{project_id}/trigger_ipo_completion")
def trigger_secondary_market(
    project_id: str,
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).with_for_update().first()
    if not project or project.ipo_status != 'active':
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Project IPO must be 'active'.")
        
    project.ipo_status = 'completed'
    project.previous_close_price = project.ipo_price # Baseline bounds
    db.commit()
    return {"success": True, "message": "Secondary Market trading is now completely unlocked!"}

# --- Macro Analytics Management ---

@router.get("/analytics/macro", response_model=List[MacroDataResponse])
def admin_list_macro_data(
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    return db.query(MacroAnalytics).order_by(MacroAnalytics.pincode).all()

@router.post("/analytics/macro", response_model=MacroDataResponse)
def admin_create_macro_data(
    data: MacroAnalyticsCreate,
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    # Check if exists
    existing = db.query(MacroAnalytics).filter(MacroAnalytics.pincode == data.pincode).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Pincode already exists.")
        
    new_record = MacroAnalytics(**data.model_dump())
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    return new_record

@router.put("/analytics/macro/{pincode}", response_model=MacroDataResponse)
def admin_update_macro_data(
    pincode: str,
    data: MacroAnalyticsUpdate,
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    record = db.query(MacroAnalytics).filter(MacroAnalytics.pincode == pincode).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pincode not found.")
        
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(record, key, value)
        
    db.commit()
    db.refresh(record)
    return record

@router.delete("/analytics/macro/{pincode}")
def admin_delete_macro_data(
    pincode: str,
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    record = db.query(MacroAnalytics).filter(MacroAnalytics.pincode == pincode).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pincode not found.")
        
    db.delete(record)
    db.commit()
    return {"success": True, "message": f"Pincode {pincode} deleted successfully."}
