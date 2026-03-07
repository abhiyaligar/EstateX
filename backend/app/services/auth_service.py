from fastapi import HTTPException, status
from app.core.database import supabase
from app.schemas.auth import UserCreate, UserLogin, Token, User
from app.models.user import User as DBUser
from sqlalchemy.orm import Session

class AuthService:
    @staticmethod
    def register_user(user_data: UserCreate, db: Session):
        try:
            # 1. Sign up on Supabase
            res = supabase.auth.sign_up({
                "email": user_data.email,
                "password": user_data.password,
                "options": {
                    "data": user_data.user_metadata
                }
            })
            
            supabase_user = res.user
            if not supabase_user:
                raise Exception("Failed to create user in Supabase")
                
            # 2. Extract specific metadata mapped directly from Supabase to our schema
            first_name = user_data.user_metadata.get("first_name")
            last_name = user_data.user_metadata.get("last_name")
            phone = user_data.user_metadata.get("phone")
                
            # 3. Create user in PostgreSQL
            db_user = DBUser(
                id=supabase_user.id,
                email=user_data.email,
                phone=phone,
                first_name=first_name,
                last_name=last_name,
                role='investor'
            )
            
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
            
            return supabase_user
            
        except Exception as e:
            db.rollback()
            error_detail = getattr(e, 'message', str(e))
            status_code = getattr(e, 'status', status.HTTP_400_BAD_REQUEST)
            raise HTTPException(
                status_code=status_code,
                detail=error_detail
            )

    @staticmethod
    def login_user(user_data: UserLogin) -> Token:
        try:
            res = supabase.auth.sign_in_with_password({
                "email": user_data.email,
                "password": user_data.password
            })
            if res.session:
                return Token(
                    access_token=res.session.access_token,
                    refresh_token=res.session.refresh_token,
                    expires_in=res.session.expires_in
                )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        except Exception as e:
            error_detail = getattr(e, 'message', str(e))
            status_code = getattr(e, 'status', status.HTTP_401_UNAUTHORIZED)
            if "Invalid credentials" in error_detail or "Invalid login credentials" in error_detail:
                status_code = status.HTTP_401_UNAUTHORIZED
            raise HTTPException(
                status_code=status_code,
                detail=error_detail
            )
