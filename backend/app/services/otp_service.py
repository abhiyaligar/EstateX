from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.otp import OTPRecord
from app.models.user import User
from app.core.email import send_email
import random
import datetime

class OTPService:
    @staticmethod
    def generate_and_send_otp(email: str, purpose: str, db: Session, payload: dict = None):
        # Invalidate old unused OTPs for this specific purpose
        db.query(OTPRecord).filter(
            OTPRecord.email == email, 
            OTPRecord.purpose == purpose,
            OTPRecord.is_used == False
        ).update({"is_used": True})
        
        # Generate 6 digit OTP
        otp_code = str(random.randint(100000, 999999))
        
        # Create new OTP record valid for 5 minutes
        expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=5)
        otp_record = OTPRecord(
            email=email, 
            otp_code=otp_code, 
            purpose=purpose,
            payload=payload,
            expires_at=expires_at
        )
        
        db.add(otp_record)
        db.commit()
        
        # Determine Email Content based on purpose
        subject = "EstateX Verification Code"
        body = f"<p>Your verification code is: <strong>{otp_code}</strong></p><p>This code will expire in 5 minutes.</p>"
        
        if purpose == "withdrawal":
            amount = payload.get("amount", 0) if payload else 0
            subject = "EstateX - Withdrawal Authorization"
            body = f"""
            <h2>Withdrawal Request</h2>
            <p>You have requested to withdraw <strong>${amount}</strong> from your EstateX wallet.</p>
            <p>Your authorization code is: <h3 style='color:blue;'>{otp_code}</h3></p>
            <p>If you did not request this, please contact support immediately.</p>
            """
        elif purpose == "forgot_password":
            subject = "EstateX - Password Reset"
            body = f"""
            <h2>Password Reset Request</h2>
            <p>We received a request to reset your EstateX password.</p>
            <p>Your password reset code is: <h3 style='color:blue;'>{otp_code}</h3></p>
            <p>If you did not request a password reset, you can safely ignore this email.</p>
            """
        elif purpose == "signup":
            subject = "EstateX - Registration Verification"
            body = f"""
            <h2>Welcome to EstateX!</h2>
            <p>To complete your registration, please verify your email address.</p>
            <p>Your verification code is: <h3 style='color:goldenrod;'>{otp_code}</h3></p>
            <p>This code will expire in 5 minutes.</p>
            """
        elif purpose == "login":
            subject = "EstateX - Access Authorization"
            body = f"""
            <h2>Login Authorization</h2>
            <p>You requested a secure login code for EstateX.</p>
            <p>Your authorization code is: <h3 style='color:goldenrod;'>{otp_code}</h3></p>
            <p>If you did not request this, please secure your account.</p>
            """
        
        # Send Email
        send_email(to_email=email, subject=subject, body=body)
        return True

    @staticmethod
    def verify_otp(email: str, otp_code: str, purpose: str, db: Session):
        otp_record = db.query(OTPRecord).filter(
            OTPRecord.email == email,
            OTPRecord.otp_code == otp_code,
            OTPRecord.purpose == purpose,
            OTPRecord.is_used == False,
            OTPRecord.expires_at > datetime.datetime.utcnow()
        ).first()
        
        if not otp_record:
            raise HTTPException(status_code=400, detail="Invalid or expired OTP code.")
            
        # Extract payload before marking used
        payload = otp_record.payload
        
        # Mark as used
        otp_record.is_used = True
        db.commit()
        
        return payload
