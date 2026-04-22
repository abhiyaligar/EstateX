from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.builder import Builder
from app.models.user import User as DBUser
from app.schemas.builder import BuilderCreate, BuilderVerificationUpdate
import datetime
from typing import Any

class BuilderService:
    @staticmethod
    def create_profile(user_id: str, profile_data: BuilderCreate, db: Session) -> Builder:
        # Check if they already have a profile
        existing = db.query(Builder).filter(Builder.id == user_id).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Builder profile already exists.")
            
        new_builder = Builder(
            id=user_id,
            company_name=profile_data.company_name,
            company_registration_number=profile_data.company_registration_number,
            rera_registration_number=profile_data.rera_registration_number,
            headquarters_address=profile_data.headquarters_address,
            headquarters_city=profile_data.headquarters_city,
            headquarters_state=profile_data.headquarters_state,
            headquarters_pincode=profile_data.headquarters_pincode,
            year_established=profile_data.year_established,
            verification_status='details_required'
        )
        
        db.add(new_builder)
        db.commit()
        db.refresh(new_builder)
        return new_builder

    @staticmethod
    def submit_for_review(builder_id: str, db: Session) -> Builder:
        builder = db.query(Builder).filter(Builder.id == builder_id).first()
        if not builder:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Builder profile not found.")
        
        if builder.verification_status not in ['details_required', 'rejected']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail=f"Cannot submit for review when status is {builder.verification_status}"
            )
        
        # Check if basic bank details are present before allowing submission
        if not all([builder.bank_account_name, builder.bank_account_number, builder.bank_ifsc_code]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Please complete your bank account details before submitting for official review."
            )

        builder.verification_status = 'pending'
        db.commit()
        db.refresh(builder)
        return builder

    @staticmethod
    def update_bank_account(builder_id: str, bank_data: Any, db: Session) -> Builder:
        builder = db.query(Builder).filter(Builder.id == builder_id).first()
        
        if not builder:
            # First time setup - initialize basic profile
            builder = Builder(
                id=builder_id,
                company_name=bank_data.company_name,
                verification_status='details_required'
            )
            db.add(builder)
            
        builder.bank_account_name = bank_data.bank_account_name
        builder.bank_name = bank_data.bank_name
        builder.bank_account_number = bank_data.bank_account_number
        builder.bank_ifsc_code = bank_data.bank_ifsc_code
        
        db.commit()
        db.refresh(builder)
        return builder

    @staticmethod
    def get_pending_builders(db: Session):
        return db.query(Builder).filter(Builder.verification_status == 'pending').all()

    @staticmethod
    def get_profile(builder_id: str, db: Session) -> Builder:
        builder = db.query(Builder).filter(Builder.id == builder_id).first()
        if not builder:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Builder profile not found.")
        return builder

    @staticmethod
    def get_public_profile(builder_id: str, db: Session) -> Builder:
        builder = db.query(Builder).filter(Builder.id == builder_id).first()
        if not builder or builder.verification_status != 'approved':
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Verified builder profile not found."
            )
        return builder

    @staticmethod
    def verify_builder(builder_id: str, verification_data: BuilderVerificationUpdate, db: Session):
        builder = db.query(Builder).filter(Builder.id == builder_id).first()
        if not builder:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Builder profile not found.")
            
        builder.verification_status = verification_data.status
        
        if verification_data.status == 'approved':
            builder.document_verified = True
            builder.documents_verified_date = datetime.datetime.utcnow()
            builder.rejection_reason = None
        elif verification_data.status == 'rejected':
            builder.document_verified = False
            builder.rejection_reason = verification_data.rejection_reason
            
        db.commit()
        db.refresh(builder)
        return builder
