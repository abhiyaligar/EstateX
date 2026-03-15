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
