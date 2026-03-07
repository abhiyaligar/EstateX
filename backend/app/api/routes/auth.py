from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.auth import UserCreate, UserLogin, Token, User
from app.services.auth_service import AuthService
from app.middleware.auth import get_current_user
from app.core.db import get_db

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=User)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user through Supabase Auth, and save them to the local PostgreSQL database.
    """
    user = AuthService.register_user(user_data, db)
    
    return User(
        id=user.id,
        email=user.email if hasattr(user, 'email') else "",
        role=getattr(user, 'role', 'investor'),
        created_at=str(user.created_at) if hasattr(user, 'created_at') else None
    )

@router.post("/login", response_model=Token)
def login(user_data: UserLogin):
    """
    Login an existing user and get a JWT token.
    """
    return AuthService.login_user(user_data)

@router.get("/me", response_model=User)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Get current logged in user details using the access token.
    Demonstrates route protection using Supabase auth.
    """
    return current_user
