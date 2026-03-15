import uuid
import hashlib
from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.kyc import KYCRecord
from app.models.user import User as DBUser
from app.schemas.kyc import KYCInitiateRequest, KYCVerifyOTPRequest, KYCVerifyPANRequest

class KYCService:
    @staticmethod
    def initiate_kyc(user_id: str, kyc_data: KYCInitiateRequest, db: Session):
        # 1. Check if KYC already exists or is pending
        existing_kyc = db.query(KYCRecord).filter(KYCRecord.user_id == user_id).first()
        
        if existing_kyc:
            if existing_kyc.status == 'approved':
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="KYC is already approved")
            # If not approved, we reset the session
            kyc_record = existing_kyc
        else:
            kyc_record = KYCRecord(user_id=user_id)
            db.add(kyc_record)

        # 2. Hash Aadhaar for security and store last 4 digits
        aadhaar_str = kyc_data.aadhaar
        kyc_record.aadhaar_hash = hashlib.sha256(aadhaar_str.encode()).hexdigest()
        kyc_record.aadhaar_last_4_digits = aadhaar_str[-4:]
        
        # 3. Save PAN for later verification
        kyc_record.pan_number = kyc_data.pan
        
        # 4. Generate a fake session ID and simulate sending OTP
        kyc_session_id = f"kyc_sim_{uuid.uuid4().hex[:10]}"
        kyc_record.session_id = kyc_session_id
        kyc_record.status = 'otp_sent'
        kyc_record.otp_sent_count = (kyc_record.otp_sent_count or 0) + 1
        
        db.commit()
        
        return {
            "kyc_session_id": kyc_session_id,
            "status": "otp_sent",
            "message": "OTP sent to registered phone (Simulated)",
            "retry_after": 30
        }

    @staticmethod
    def verify_otp(user_id: str, otp_data: KYCVerifyOTPRequest, db: Session):
        kyc_record = db.query(KYCRecord).filter(
            KYCRecord.user_id == user_id, 
            KYCRecord.session_id == otp_data.kyc_session_id
        ).first()
        
        if not kyc_record:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid KYC Session")
            
        if kyc_record.status != 'otp_sent':
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP was not requested or already verified")

        # SIMULATION: Accept any 6 digit OTP for the sake of the mock
        if len(otp_data.otp) != 6:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OTP format")
            
        # Update record
        kyc_record.status = 'otp_verified'
        kyc_record.aadhaar_verified = True
        kyc_record.aadhaar_verified_at = datetime.now(timezone.utc)
        kyc_record.otp_verified_count = (kyc_record.otp_verified_count or 0) + 1
        
        db.commit()
        
        return {
            "status": "otp_verified",
            "message": "Aadhaar verified. Please verify PAN."
        }

    @staticmethod
    def verify_pan(user_id: str, pan_data: KYCVerifyPANRequest, db: Session):
        kyc_record = db.query(KYCRecord).filter(
            KYCRecord.user_id == user_id, 
            KYCRecord.session_id == pan_data.kyc_session_id
        ).first()
        
        if not kyc_record:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid KYC Session")
            
        if kyc_record.status != 'otp_verified':
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP must be verified before PAN")
            
        if kyc_record.pan_number != pan_data.pan:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="PAN does not match the one provided during initiation")

        # SIMULATION: Automatically approve the PAN
        kyc_record.status = 'approved'
        kyc_record.pan_verified = True
        kyc_record.pan_verified_at = datetime.now(timezone.utc)
        
        # Crucial Step: Update the parent User record as well
        user = db.query(DBUser).filter(DBUser.id == user_id).first()
        if user:
            user.kyc_status = 'approved'
            
        db.commit()
        
        return {
            "status": "approved",
            "message": "KYC verification completed successfully"
        }

    @staticmethod
    def get_status(user_id: str, db: Session):
        kyc_record = db.query(KYCRecord).filter(KYCRecord.user_id == user_id).first()
        
        if not kyc_record:
            return {
                "status": "pending",
                "verified_date": None,
                "aadhaar_verified": False,
                "pan_verified": False,
                "rejection_reason": None
            }
            
        return {
            "status": kyc_record.status,
            "verified_date": kyc_record.pan_verified_at if kyc_record.status == 'approved' else None,
            "aadhaar_verified": kyc_record.aadhaar_verified,
            "pan_verified": kyc_record.pan_verified,
            "rejection_reason": kyc_record.rejection_reason
        }
