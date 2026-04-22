from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.builder import Builder
from app.models.user import User as DBUser
from app.schemas.builder import BuilderCreate, BuilderVerificationUpdate
import datetime
from typing import Any

class BuilderService:
    @staticmethod
    def update_profile(builder_id: str, profile_data: BuilderCreate, db: Session) -> Builder:
        builder = db.query(Builder).filter(Builder.id == builder_id).first()
        if not builder:
            # Fallback to creation if it doesn't exist (though it should from the Wallet flow)
            builder = Builder(id=builder_id, company_name=profile_data.company_name)
            db.add(builder)
            
        # Update fields
        for field, value in profile_data.model_dump(exclude_unset=True).items():
            setattr(builder, field, value)
            
        builder.verification_status = 'details_required' # Reset to details_required on major edit
        db.commit()
        db.refresh(builder)
        return builder

    @staticmethod
    def submit_for_review(builder_id: str, db: Session) -> Builder:
        builder = db.query(Builder).filter(Builder.id == builder_id).first()
        if not builder:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Builder profile not found.")
        
        if builder.verification_status not in ['details_required', 'rejected', 'revision_required']:
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
        else:
            # For 'rejected' or 'revision_required'
            builder.document_verified = False
            builder.rejection_reason = verification_data.rejection_reason
            
        db.commit()
        db.refresh(builder)
        return builder
