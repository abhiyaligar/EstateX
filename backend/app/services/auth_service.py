from fastapi import HTTPException, status
from app.core.database import supabase
from app.schemas.auth import UserCreate, UserLogin, Token, User, OAuthSyncRequest
from app.models.user import User as DBUser
from app.models.kyc import KYCRecord
from app.models.builder import Builder
from sqlalchemy.orm import Session
from app.models.otp import OTPRecord
from app.core.database import supabase, supabase_admin
import random
import datetime

class AuthService:
    @staticmethod
    def register_user(user_data: UserCreate, db: Session):
        try:
            # 1. Sign up on Supabase
            res = supabase.auth.sign_up({
                "email": user_data.email,
                "password": user_data.password,
                "options": {
                    "data": {
                        **user_data.user_metadata,
                        "role": user_data.role # Embed the requested role into Supabase metadata
                    }
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
                role=user_data.role,
                investment_preference=user_data.user_metadata.get("investment_preference")
            )
            
            db.add(db_user)
            db.flush() # Get the ID for relationships
            
            # 4. Create KYC Record for Manual Review
            aadhaar = user_data.user_metadata.get("aadhaar")
            pan = user_data.user_metadata.get("pan")
            
            kyc_record = KYCRecord(
                user_id=db_user.id,
                aadhaar_last_4_digits=aadhaar[-4:] if aadhaar and len(aadhaar) >= 4 else None,
                pan_number=pan,
                status='pending' # This flags it for Admin manual review
            )
            db.add(kyc_record)
            
            # 5. Handle Builder Profile if applicable
            if user_data.role == 'builder':
                builder_profile = Builder(
                    id=db_user.id,
                    company_name=user_data.user_metadata.get("entity_name") or f"{first_name} {last_name}",
                    business_type=user_data.user_metadata.get("registration_type"),
                    rera_registration_number=user_data.user_metadata.get("license_number"),
                    verification_status='pending'
                )
                db.add(builder_profile)
                
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

    @staticmethod
    def refresh_user_session(refresh_token: str) -> Token:
        try:
            res = supabase.auth.refresh_session(refresh_token)
            if res.session:
                return Token(
                    access_token=res.session.access_token,
                    refresh_token=res.session.refresh_token,
                    expires_in=res.session.expires_in
                )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        except Exception as e:
            error_detail = getattr(e, 'message', str(e))
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=error_detail
            )

    @staticmethod
    def forgot_password(email: str, db: Session) -> str:
        # Check if user exists
        user = db.query(DBUser).filter(DBUser.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        # Generate 6 digit OTP
        otp_code = str(random.randint(100000, 999999))
        
        # Invalidate old unused OTPs
        db.query(OTPRecord).filter(OTPRecord.email == email, OTPRecord.is_used == False).update({"is_used": True})
        
        # Create new OTP record valid for 10 minutes
        expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
        otp_record = OTPRecord(email=email, otp_code=otp_code, expires_at=expires_at)
        
        db.add(otp_record)
        db.commit()
        
        # Return the generated OTP (since we are not sending emails yet)
        return otp_code

    @staticmethod
    def reset_password(email: str, otp: str, new_password: str, db: Session):
        if not supabase_admin:
            raise HTTPException(
                status_code=500, 
                detail="Server configuration error: SUPABASE_SERVICE_KEY is required to reset passwords."
            )
            
        # Verify OTP
        otp_record = db.query(OTPRecord).filter(
            OTPRecord.email == email,
            OTPRecord.otp_code == otp,
            OTPRecord.is_used == False,
            OTPRecord.expires_at > datetime.datetime.utcnow()
        ).first()
        
        if not otp_record:
            raise HTTPException(status_code=400, detail="Invalid or expired OTP")
            
        user = db.query(DBUser).filter(DBUser.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        try:
            # Update password in Supabase via Admin API
            supabase_admin.auth.admin.update_user_by_id(
                str(user.id),
                {"password": new_password}
            )
            
            # Mark OTP as used
            otp_record.is_used = True
            db.commit()
            
            return True
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Failed to reset password: {str(e)}")
    @staticmethod
    def sync_oauth_user(data: OAuthSyncRequest, db: Session):
        """
        Synchronizes a user from Supabase OAuth to the local PostgreSQL database.
        Creates a new user record if it doesn't exist.
        """
        try:
            # Check if user exists in local DB by supabase_id (which is our PK)
            user = db.query(DBUser).filter(DBUser.id == data.supabase_id).first()
            
            if not user:
                # First time OAuth login, create local record
                first_name = data.full_name.split(' ')[0] if data.full_name else None
                last_name = ' '.join(data.full_name.split(' ')[1:]) if data.full_name and len(data.full_name.split(' ')) > 1 else None
                
                user = DBUser(
                    id=data.supabase_id,
                    email=data.email,
                    first_name=first_name,
                    last_name=last_name,
                    profile_image_url=data.avatar_url,
                    role='investor', # Default role for new OAuth users
                    email_verified=True # OAuth users are pre-verified by the provider
                )
                db.add(user)
                db.commit()
                db.refresh(user)
                
            return user
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to synchronize OAuth user: {str(e)}"
            )
