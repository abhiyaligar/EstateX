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
            
            # Trigger local OTP generation for registration verification
            from app.services.otp_service import OTPService
            OTPService.generate_and_send_otp(email=user_data.email, purpose="signup", db=db)
            
            return supabase_user
        except Exception as e:
            db.rollback()
            # Capture the specific error from Supabase if available
            error_msg = str(e)
            if hasattr(e, 'message'):
                error_msg = e.message
            
            print(f"DEBUG: Supabase Registration Error: {error_msg}")
            
            # Surface a more descriptive error to the frontend
            if "User already registered" in error_msg:
                raise HTTPException(status_code=400, detail="This email address is already registered.")
            
            if "users_phone_key" in error_msg:
                raise HTTPException(status_code=400, detail="This phone number is already registered.")
            
            if "duplicate key value" in error_msg:
                raise HTTPException(status_code=400, detail="Record already exists (Email or Phone).")

            raise HTTPException(
                status_code=getattr(e, 'status', 400),
                detail=f"Registration Error: {error_msg}"
            )

    @staticmethod
    def login_user(user_data: UserLogin, db: Session) -> Token:
        try:
            res = supabase.auth.sign_in_with_password({
                "email": user_data.email,
                "password": user_data.password
            })
            if res.session:
                # ─── AUTO-SYNC CHECK ───
                # Ensure user exists in our local PostgreSQL DB
                supabase_user = res.user
                db_user = db.query(DBUser).filter(DBUser.id == supabase_user.id).first()
                
                if not db_user:
                    print(f"DEBUG: Syncing missing user {user_data.email} to PostgreSQL on login.")
                    user_metadata = supabase_user.user_metadata or {}
                    
                    # Create the local user record
                    db_user = DBUser(
                        id=supabase_user.id,
                        email=user_data.email,
                        phone=user_metadata.get("phone"),
                        first_name=user_metadata.get("first_name"),
                        last_name=user_metadata.get("last_name"),
                        role=user_metadata.get("role", "investor"),
                        investment_preference=user_metadata.get("investment_preference")
                    )
                    db.add(db_user)
                    
                    # Create a default KYC record if missing
                    kyc_record = KYCRecord(
                        user_id=db_user.id,
                        status='pending'
                    )
                    db.add(kyc_record)
                    
                    # Handle builder profile if role matches
                    if user_metadata.get("role") == 'builder':
                        builder_profile = Builder(
                            id=db_user.id,
                            company_name=user_metadata.get("entity_name") or f"{user_metadata.get('first_name')} {user_metadata.get('last_name')}",
                            business_type=user_metadata.get("registration_type"),
                            rera_registration_number=user_metadata.get("license_number"),
                            verification_status='pending'
                        )
                        db.add(builder_profile)
                    
                    db.commit()

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
            db.rollback()
            error_detail = getattr(e, 'message', str(e))
            status_code = getattr(e, 'status', status.HTTP_401_UNAUTHORIZED)
            if "Invalid credentials" in error_detail or "Invalid login credentials" in error_detail:
                status_code = status.HTTP_401_UNAUTHORIZED
            raise HTTPException(
                status_code=status_code,
                detail=error_detail
            )

    @staticmethod
    def send_auth_otp(email: str, user_metadata: dict = None):
        try:
            options = {}
            if user_metadata:
                options["data"] = user_metadata
                
            # supabase.auth.sign_in_with_otp sends a magic link or OTP depending on Supabase settings
            res = supabase.auth.sign_in_with_otp({
                "email": email,
                "options": options
            })
            return True
        except Exception as e:
            error_detail = getattr(e, 'message', str(e))
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_detail
            )

    @staticmethod
    def verify_auth_otp(email: str, otp_code: str, otp_type: str, db: Session) -> Token:
        try:
            res = supabase.auth.verify_otp({
                "email": email,
                "token": otp_code,
                "type": otp_type
            })
            
            if not res.session:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid or expired OTP"
                )
                
            supabase_user = res.user
            
            # Sync to local DB if it's a new user
            db_user = db.query(DBUser).filter(DBUser.id == supabase_user.id).first()
            if not db_user:
                user_metadata = supabase_user.user_metadata or {}
                first_name = user_metadata.get("first_name")
                last_name = user_metadata.get("last_name")
                phone = user_metadata.get("phone")
                role = user_metadata.get("role", "investor")
                
                db_user = DBUser(
                    id=supabase_user.id,
                    email=email,
                    phone=phone,
                    first_name=first_name,
                    last_name=last_name,
                    role=role,
                    investment_preference=user_metadata.get("investment_preference")
                )
                db.add(db_user)
                db.flush()
                
                aadhaar = user_metadata.get("aadhaar")
                pan = user_metadata.get("pan")
                kyc_record = KYCRecord(
                    user_id=db_user.id,
                    aadhaar_last_4_digits=aadhaar[-4:] if aadhaar and len(aadhaar) >= 4 else None,
                    pan_number=pan,
                    status='pending'
                )
                db.add(kyc_record)
                
                if role == 'builder':
                    builder_profile = Builder(
                        id=db_user.id,
                        company_name=user_metadata.get("entity_name") or f"{first_name} {last_name}",
                        business_type=user_metadata.get("registration_type"),
                        rera_registration_number=user_metadata.get("license_number"),
                        verification_status='pending'
                    )
                    db.add(builder_profile)
                    
                db.commit()

            return Token(
                access_token=res.session.access_token,
                refresh_token=res.session.refresh_token,
                expires_in=res.session.expires_in
            )
            
        except Exception as e:
            db.rollback()
            error_detail = getattr(e, 'message', str(e))
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
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
        from app.services.otp_service import OTPService
        # Check if user exists
        user = db.query(DBUser).filter(DBUser.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        OTPService.generate_and_send_otp(email, purpose="forgot_password", db=db)
        return "OTP sent successfully"

    @staticmethod
    def reset_password(email: str, otp: str, new_password: str, db: Session):
        if not supabase_admin:
            raise HTTPException(
                status_code=500, 
                detail="Server configuration error: SUPABASE_SERVICE_KEY is required to reset passwords."
            )
            
        from app.services.otp_service import OTPService
        # Verify OTP
        OTPService.verify_otp(email, otp, purpose="forgot_password", db=db)
            
        user = db.query(DBUser).filter(DBUser.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        try:
            # Update password in Supabase via Admin API
            supabase_admin.auth.admin.update_user_by_id(
                str(user.id),
                {"password": new_password}
            )
            return True
        except Exception as e:
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

    @staticmethod
    def verify_registration_otp_local(email: str, otp_code: str, db: Session):
        from app.services.otp_service import OTPService
        # Simply verify the local OTP
        OTPService.verify_otp(email, otp_code, purpose="signup", db=db)
        return True

    @staticmethod
    def send_login_otp(email: str, db: Session):
        # Check if user exists first
        user = db.query(DBUser).filter(DBUser.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="Account not found. Please register first.")
            
        from app.services.otp_service import OTPService
        OTPService.generate_and_send_otp(email, purpose="login", db=db)
        return True

    @staticmethod
    def verify_login_otp(email: str, otp_code: str, db: Session) -> Token:
        from app.services.otp_service import OTPService
        # 1. Verify the local OTP (our 6-digit custom code)
        OTPService.verify_otp(email, otp_code, purpose="login", db=db)
        
        # 2. Secure Bridge: Sign the user into Supabase WITHOUT changing their password
        # We use the Admin API to generate a one-time login link/hash
        user = db.query(DBUser).filter(DBUser.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User records synchronized incorrectly.")

        try:
            # Generate a magic link hash via Admin API (Non-destructive)
            # This doesn't send an email because we just want the hash
            link_data = supabase_admin.auth.admin.generate_link({
                "type": "magiclink",
                "email": email
            })
            
            # The SDK returns a GenerateLinkResponse object. We need the hashed_token.
            token_hash = getattr(link_data, 'hashed_token', None)
            
            if not token_hash:
                # Some versions might put it in a properties dict or nested object
                properties = getattr(link_data, 'properties', {})
                if isinstance(properties, dict):
                    token_hash = properties.get('hashed_token')
                else:
                    token_hash = getattr(properties, 'hashed_token', None)

            if not token_hash:
                raise Exception("Could not extract token hash from Supabase response.")
            
            # 3. Use the hash to get a real session
            res = supabase.auth.verify_otp({
                "token_hash": token_hash,
                "type": "magiclink"
            })
            
            if res.session:
                return Token(
                    access_token=res.session.access_token,
                    refresh_token=res.session.refresh_token,
                    expires_in=res.session.expires_in
                )
            
            raise HTTPException(status_code=401, detail="Authentication failed after OTP verification.")
        except Exception as e:
            print(f"DEBUG: OTP Bridge Error: {str(e)}")
            # If magiclink fails, we could fallback to the old way, but better to fix the SDK usage
            raise HTTPException(status_code=500, detail=f"Failed to generate secure session: {str(e)}")

    @staticmethod
    def resend_otp(email: str, purpose: str, db: Session):
        from app.services.otp_service import OTPService
        # For resend, we don't necessarily check if user exists for 'signup' 
        # as the user is already created in PostgreSQL during register_user call.
        # But for other purposes, we might want to check.
        
        if purpose in ['login', 'forgot_password', 'withdrawal']:
            user = db.query(DBUser).filter(DBUser.email == email).first()
            if not user:
                raise HTTPException(status_code=404, detail="Account not found.")

        OTPService.generate_and_send_otp(email=email, purpose=purpose, db=db)
        return True
