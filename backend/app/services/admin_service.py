from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status
from app.models.user import User as DBUser
from app.models.kyc import KYCRecord
from app.schemas.admin import DashboardStatsResponse, KYCReviewRequest

class AdminService:
    @staticmethod
    def get_dashboard_stats(db: Session) -> DashboardStatsResponse:
        # Group users by their specific roles and convert back to a dictionary table mapping
        role_counts = dict(
            db.query(DBUser.role, func.count(DBUser.id))
            .group_by(DBUser.role)
            .all()
        )
        
        # Count all users
        total_users = sum(role_counts.values())
        
        # Count KYC records waiting on admin approval (Assuming OTP was verified but pan check is pending)
        pending_kyc = db.query(func.count(KYCRecord.id)).filter(
            KYCRecord.status.in_(['pending', 'otp_verified']) 
        ).scalar() or 0
        
        return DashboardStatsResponse(
            total_users=total_users,
            total_investors=role_counts.get('investor', 0),
            total_builders=role_counts.get('builder', 0),
            total_admins=role_counts.get('admin', 0),
            kyc_pending_approvals=pending_kyc
        )

    @staticmethod
    def get_kyc_applications(db: Session, status_filter: str = 'all'):
        query = db.query(KYCRecord)
        
        if status_filter != 'all':
            query = query.filter(KYCRecord.status == status_filter)
        else:
            # By default, only show relevant ones (not rejected)
            query = query.filter(KYCRecord.status.in_(['pending', 'otp_verified', 'approved']))
            
        return query.order_by(KYCRecord.created_at.desc()).all()

    @staticmethod
    def review_kyc_application(kyc_id: str, review_data: KYCReviewRequest, db: Session):
        kyc_record = db.query(KYCRecord).filter(KYCRecord.id == kyc_id).first()
        
        if not kyc_record:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="KYC Application not found")
            
        # Optional: You might enforce that only 'otp_verified' applications can be reviewed here
        # But we'll leave it open for manual admin override.
        
        kyc_record.status = review_data.status
        if review_data.status == 'rejected':
            kyc_record.rejection_reason = review_data.rejection_reason
            
        # Look up parent User and safely update their KYC cache Status
        user = db.query(DBUser).filter(DBUser.id == kyc_record.user_id).first()
        if user:
            user.kyc_status = review_data.status
            
        db.commit()
        
        return {
            "success": True,
            "message": f"Successfully marked KYC application as {review_data.status}",
            "kyc_status": kyc_record.status
        }
