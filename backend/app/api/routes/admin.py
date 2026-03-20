from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.schemas.auth import User
from app.schemas.admin import (
    DashboardStatsResponse, KYCReviewRequest, AdminKYCRecordBase, KYCReviewResponse,
    AdminMilestoneReviewRequest, AdminProjectStatusUpdateRequest
)
from app.schemas.builder import BuilderVerificationUpdate, BuilderResponse
from app.schemas.wallet import AdminWalletAdjustmentRequest
from app.middleware.auth import get_admin_user
from app.services.admin_service import AdminService
from app.services.builder_service import BuilderService
from app.services.wallet_service import WalletService
from app.core.db import get_db

router = APIRouter(prefix="/admin", tags=["Admin Portal"])

@router.get("/dashboard-stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    return AdminService.get_dashboard_stats(db)

@router.get("/kyc-applications", response_model=List[AdminKYCRecordBase])
def list_kyc_applications(
    status: str = 'all',
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    return AdminService.get_kyc_applications(db, status_filter=status)

@router.post("/kyc-applications/{kyc_id}/review", response_model=KYCReviewResponse)
def review_kyc_application(
    kyc_id: UUID,
    review_data: KYCReviewRequest,
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    return AdminService.review_kyc_application(str(kyc_id), review_data, db)

@router.post("/builders/{builder_id}/verify", response_model=BuilderResponse)
def verify_builder_profile(
    builder_id: UUID,
    verification_data: BuilderVerificationUpdate,
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    return BuilderService.verify_builder(str(builder_id), verification_data, db)

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
