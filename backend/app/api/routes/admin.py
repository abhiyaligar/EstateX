from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.schemas.auth import User
from app.schemas.admin import DashboardStatsResponse, KYCReviewRequest, AdminKYCRecordBase, KYCReviewResponse
from app.middleware.auth import get_admin_user
from app.services.admin_service import AdminService
from app.core.db import get_db

router = APIRouter(prefix="/admin", tags=["Admin Portal"])

@router.get("/dashboard-stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Returns high-level platform statistics mapped directly from the PostgreSQL tables.
    Requires 'admin' role.
    """
    return AdminService.get_dashboard_stats(db)

@router.get("/kyc-applications", response_model=List[AdminKYCRecordBase])
def list_kyc_applications(
    status: str = 'all',
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Fetch a list of KYC Applications submitted by users.
    Optional query 'status' filters by pending, otp_verified, approved, etc.
    """
    return AdminService.get_kyc_applications(db, status_filter=status)

@router.post("/kyc-applications/{kyc_id}/review", response_model=KYCReviewResponse)
def review_kyc_application(
    kyc_id: UUID,
    review_data: KYCReviewRequest,
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Manually approve or reject a pending KYC application.
    Updates both the KYC Record and the Parent User's core `kyc_status` attribute.
    """
    return AdminService.review_kyc_application(str(kyc_id), review_data, db)
