from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.user import UserProfileUpdate, UserProfileResponse
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
