from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import supabase
from app.core.db import get_db
from app.models.user import User as DBUser
from app.schemas.auth import User
import logging

logger = logging.getLogger(__name__)

# FastAPI security scheme to extract the Bearer token
security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency that validates the JWT token against Supabase.
    If valid, fetches the user's genuine role from PostgreSQL.
    """
    token = credentials.credentials
    try:
        res = supabase.auth.get_user(token)
        
        user_data = res.user
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or token invalid."
            )
        
        # Fetch the synced user from PostgreSQL to get their REAL application role
        db_user = db.query(DBUser).filter(DBUser.id == user_data.id).first()
        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User authenticated in Supabase but not found in PostgreSQL."
            )
            
        return User(
            id=str(db_user.id),
            email=db_user.email,
            role=db_user.role,
            kyc_status=db_user.kyc_status,
            created_at=str(db_user.created_at)
        )

    except Exception as e:
        logger.error(f"Token validation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependency that ensures the authenticated user has the 'admin' role.
    """
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to perform this action. Admin role required."
        )
    return current_user

def get_builder_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependency that ensures the authenticated user has the 'builder' (or 'admin') role.
    """
    if current_user.role not in ['builder', 'admin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to perform this action. Builder role required."
        )
    return current_user

def get_approved_builder_user(
    current_builder: User = Depends(get_builder_user),
    db: Session = Depends(get_db)
) -> User:
    """
    Strict dependency: Ensures builder is not only authenticated but also ADMIN APPROVED.
    """
    from app.models.builder import Builder
    builder = db.query(Builder).filter(Builder.id == current_builder.id).first()
    
    if not builder:
         raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Builder profile not set up."
        )
        
    if builder.verification_status != 'approved':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Your builder profile status is '{builder.verification_status}'. You must be 'approved' by an Admin before you can post properties or manage projects."
        )
        
    return current_builder

def get_investor_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependency that ensures the authenticated user has the 'investor' (or 'admin') role.
    """
    if current_user.role not in ['investor', 'admin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to perform this action. Investor role required."
        )
    return current_user

def get_verified_user(current_user: User = Depends(get_current_user)) -> User:
    """
    STRICT SECURITY: Ensures the user has a 'verified' KYC status.
    Must be used for all financial/trading actions.
    """
    if current_user.kyc_status not in ['verified', 'approved'] and current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="KYC Verification Required. You must complete your profile and be verified by an admin before you can participate in the Asset Allocation Protocol."
        )
    return current_user
