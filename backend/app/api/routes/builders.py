from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.schemas.auth import User
from app.schemas.builder import BuilderCreate, BuilderResponse, BuilderBankAccountUpdate
from app.middleware.auth import get_builder_user, get_current_user
from app.services.builder_service import BuilderService
from app.core.db import get_db
from typing import Any

router = APIRouter(prefix="/builders", tags=["Builders"])

@router.post("/profile", response_model=BuilderResponse, status_code=status.HTTP_201_CREATED)
def create_builder_profile(
    profile_data: BuilderCreate,
    current_builder: User = Depends(get_builder_user),
    db: Session = Depends(get_db)
):
    """
    Creates the Builder's company profile.
    Requires 'builder' role.
    """
    return BuilderService.create_profile(current_builder.id, profile_data, db)

@router.get("/profile", response_model=BuilderResponse)
def get_my_builder_profile(
    current_builder: User = Depends(get_builder_user),
    db: Session = Depends(get_db)
):
    """
    Fetch the authenticated builder's own profile and verification status.
    Requires 'builder' role.
    """
    return BuilderService.get_profile(current_builder.id, db)

@router.post("/submit-review", response_model=BuilderResponse)
def submit_builder_profile_for_review(
    current_builder: User = Depends(get_builder_user),
    db: Session = Depends(get_db)
):
    """
    Submits a builder's profile for admin review. 
    Changes status from 'details_required' to 'pending'.
    """
    return BuilderService.submit_for_review(current_builder.id, db)

@router.put("/bank-account", response_model=BuilderResponse)
def update_builder_bank_account(
    bank_data: BuilderBankAccountUpdate,
    current_builder: User = Depends(get_builder_user),
    db: Session = Depends(get_db)
):
    """
    Update or register the builder's business bank account for milestone payouts.
    """
    return BuilderService.update_bank_account(current_builder.id, bank_data, db)

@router.get("/{builder_id}", response_model=BuilderResponse)
def get_verified_builder_profile(
    builder_id: str,
    db: Session = Depends(get_db)
):
    """
    Publicly fetch a builder profile. 
    Only returns data if the builder's profile verification_status is 'approved'.
    """
    return BuilderService.get_public_profile(builder_id, db)
