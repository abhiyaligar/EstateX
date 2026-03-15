from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.schemas.kyc import (
    KYCInitiateRequest, KYCInitiateResponse,
    KYCVerifyOTPRequest, KYCVerifyPANRequest, KYCStatusResponse
)
from app.schemas.auth import User
from app.services.kyc_service import KYCService
from app.middleware.auth import get_current_user
from app.core.db import get_db

router = APIRouter(prefix="/kyc", tags=["KYC Verification"])

@router.post("/initiate", response_model=KYCInitiateResponse)
def initiate_kyc(
    kyc_data: KYCInitiateRequest, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Simulated endpoint to start KYC verification.
    """
    return KYCService.initiate_kyc(str(current_user.id), kyc_data, db)

@router.post("/verify-otp")
def verify_otp(
    otp_data: KYCVerifyOTPRequest, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Simulated endpoint to verify Aadhaar OTP. 
    Accepts any 6 digit number.
    """
    return KYCService.verify_otp(str(current_user.id), otp_data, db)

@router.post("/verify-pan")
def verify_pan(
    pan_data: KYCVerifyPANRequest, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Simulated endpoint to verify PAN and approve KYC.
    """
    return KYCService.verify_pan(str(current_user.id), pan_data, db)

@router.get("/status", response_model=KYCStatusResponse)
def get_kyc_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Fetch the current KYC verification status for the authenticated user.
    """
    return KYCService.get_status(str(current_user.id), db)
