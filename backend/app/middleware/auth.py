from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import Client
from app.core.database import supabase
from app.schemas.auth import User
import logging

logger = logging.getLogger(__name__)

# FastAPI security scheme to extract the Bearer token
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """
    Dependency that validates the JWT token against Supabase.
    If valid, returns the user's data. If invalid or expired, raises exception.
    """
    token = credentials.credentials
    try:
        # Use the Supabase client to fetch the user by their JWT
        # This will automatically validate the signature and expiration against the Supabase project
        res = supabase.auth.get_user(token)
        
        user_data = res.user
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or token invalid."
            )
        
        email = getattr(user_data, 'email', "")
            
        return User(
            id=user_data.id,
            email=email if email else "",
            role=getattr(user_data, 'role', None),
            created_at=user_data.created_at.isoformat() if hasattr(user_data.created_at, 'isoformat') else user_data.created_at
        )

    except Exception as e:
        logger.error(f"Token validation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
