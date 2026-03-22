from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.schemas.user import UserProfileUpdate, UserProfileResponse, BankAccountCreate, BankAccountResponse
from app.schemas.auth import User as AuthUser
from app.models.user import User
from app.services.user_service import UserService
from app.middleware.auth import get_current_user
from app.core.db import get_db

router = APIRouter(prefix="/users", tags=["User Profiles"])

@router.get("/profile", response_model=UserProfileResponse)
def get_user_profile(
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve the beautifully expanded database profile of the authenticated user.
    """
    return db.query(User).filter(User.id == current_user.id).first()

@router.patch("/profile", response_model=UserProfileResponse)
def update_user_profile(
    update_data: UserProfileUpdate,
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Dynamically update the user's mutable profile properties.
    """
    return UserService.update_profile(current_user.id, update_data, db)

@router.post("/bank-accounts", response_model=BankAccountResponse)
def add_bank_account(
    bank_data: BankAccountCreate,
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Link a new bank account to the user profile for seamless fiat deposits and withdrawals.
    """
    return UserService.add_bank_account(current_user.id, bank_data, db)

@router.get("/bank-accounts", response_model=List[BankAccountResponse])
def get_bank_accounts(
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve all globally banked liquidity exit points configured for the current user.
    """
    return UserService.get_bank_accounts(current_user.id, db)

@router.delete("/bank-accounts/{bank_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_bank_account(
    bank_id: str,
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Drop a specific bank account from the user profile mapping.
    """
    UserService.remove_bank_account(current_user.id, bank_id, db)
