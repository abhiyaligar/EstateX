from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.auth import UserCreate, UserLogin, Token, User, OAuthSyncRequest, AuthOtpSendRequest, AuthOtpVerifyRequest, AuthOtpResendRequest
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
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """
    Login an existing user and get a JWT token.
    """
    return AuthService.login_user(user_data, db)

@router.post("/otp/send")
def send_otp(data: AuthOtpSendRequest):
    """
    Initiates a passwordless login or signup via email magic link / OTP.
    """
    AuthService.send_auth_otp(data.email, data.user_metadata)
    return {"message": "OTP has been sent."}

@router.post("/otp/verify", response_model=Token)
def verify_otp(data: AuthOtpVerifyRequest, db: Session = Depends(get_db)):
    """
    Verifies the email OTP and returns a JWT session token.
    (Legacy Supabase OTP - remains for compatibility)
    """
    return AuthService.verify_auth_otp(data.email, data.otp_code, data.otp_type, db)

@router.post("/register/verify-otp")
def verify_registration_otp(data: AuthOtpVerifyRequest, db: Session = Depends(get_db)):
    """
    Verifies the local registration OTP.
    """
    AuthService.verify_registration_otp_local(data.email, data.otp_code, db)
    return {"message": "Registration verified successfully"}

@router.post("/login/otp/send")
def send_login_otp(data: AuthOtpSendRequest, db: Session = Depends(get_db)):
    """
    Sends a local login OTP.
    """
    AuthService.send_login_otp(data.email, db)
    return {"message": "Login code sent successfully"}

@router.post("/otp/resend")
def resend_otp(data: AuthOtpResendRequest, db: Session = Depends(get_db)):
    """
    Resends a local OTP for various purposes.
    """
    AuthService.resend_otp(data.email, data.purpose, db)
    return {"message": f"OTP for {data.purpose} resent successfully"}

@router.post("/login/otp/verify", response_model=Token)
def verify_login_otp(data: AuthOtpVerifyRequest, db: Session = Depends(get_db)):
    """
    Verifies the local login OTP and returns a Supabase session.
    """
    return AuthService.verify_login_otp(data.email, data.otp_code, db)

from app.schemas.auth import TokenRefreshRequest

@router.post("/refresh", response_model=Token)
def refresh_token(data: TokenRefreshRequest):
    """
    Refresh the access token using a valid refresh token.
    """
    return AuthService.refresh_user_session(data.refresh_token)

@router.get("/me", response_model=User)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Get current logged in user details using the access token.
    Demonstrates route protection using Supabase auth.
    """
    return current_user

from app.schemas.auth import ForgotPasswordRequest, ResetPasswordRequest

@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Generates a 6-digit OTP for the given email.
    """
    otp = AuthService.forgot_password(data.email, db)
    return {"message": "OTP generated successfully", "otp": otp}

@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Resets the user's password using the generated OTP.
    """
    AuthService.reset_password(data.email, data.otp, data.new_password, db)
    return {"message": "Password reset successfully"}
@router.post("/oauth-sync", response_model=User)
def oauth_sync(data: OAuthSyncRequest, db: Session = Depends(get_db)):
    """
    Synchronize OAuth user data with the local PostgreSQL database.
    Called by the frontend after a successful OAuth login.
    """
    user = AuthService.sync_oauth_user(data, db)
    return User(
        id=str(user.id),
        email=user.email,
        role=user.role,
        kyc_status=user.kyc_status,
        created_at=str(user.created_at)
    )
