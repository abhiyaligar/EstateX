from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status
from app.models.user import User as DBUser
from app.models.kyc import KYCRecord
from app.schemas.admin import (
    DashboardStatsResponse, KYCReviewRequest, 
    AdminMilestoneReviewRequest, AdminProjectStatusUpdateRequest
)

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
    def get_kyc_applications(
        db: Session, 
        status_filter: str = 'all', 
        assigned_admin_id: str = None,
        skip: int = 0, 
        limit: int = 50
    ):
        query = db.query(KYCRecord)
        
        if status_filter != 'all':
            query = query.filter(KYCRecord.status == status_filter)
        else:
            # By default, only show relevant ones
            query = query.filter(KYCRecord.status.in_(['pending', 'otp_verified', 'approved']))

        if assigned_admin_id:
            query = query.filter(KYCRecord.assigned_admin_id == assigned_admin_id)
            
        total = query.count()
        items = query.order_by(KYCRecord.updated_at.asc()).offset(skip).limit(limit).all()
        
        return {
            "items": items,
            "total": total,
            "skip": skip,
            "limit": limit
        }

    @staticmethod
    def claim_kyc_application(kyc_id: str, admin_id: str, db: Session):
        kyc_record = db.query(KYCRecord).filter(KYCRecord.id == kyc_id).with_for_update().first()
        if not kyc_record:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="KYC Application not found")
            
        if kyc_record.assigned_admin_id and str(kyc_record.assigned_admin_id) != admin_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Application already claimed by another admin")
            
        kyc_record.assigned_admin_id = admin_id
        db.commit()
        return {"success": True, "message": "Successfully claimed application", "kyc_status": kyc_record.status}

    @staticmethod
    def release_kyc_application(kyc_id: str, admin_id: str, db: Session):
        kyc_record = db.query(KYCRecord).filter(KYCRecord.id == kyc_id).with_for_update().first()
        if not kyc_record:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="KYC Application not found")
            
        if kyc_record.assigned_admin_id and str(kyc_record.assigned_admin_id) != admin_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Application claimed by another admin")
            
        kyc_record.assigned_admin_id = None
        db.commit()
        return {"success": True, "message": "Successfully released application", "kyc_status": kyc_record.status}

    @staticmethod
    def review_kyc_application(kyc_id: str, admin_id: str, review_data: KYCReviewRequest, db: Session):
        from datetime import datetime, timezone
        kyc_record = db.query(KYCRecord).filter(KYCRecord.id == kyc_id).with_for_update().first()
        
        if not kyc_record:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="KYC Application not found")
            
        if kyc_record.assigned_admin_id and str(kyc_record.assigned_admin_id) != admin_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Application claimed by another admin")
            
        kyc_record.status = review_data.status
        if review_data.status == 'rejected':
            kyc_record.rejection_reason = review_data.rejection_reason
            
        kyc_record.reviewed_by_id = admin_id
        kyc_record.reviewed_at = datetime.now(timezone.utc)
        kyc_record.assigned_admin_id = None # Release the queue lock
            
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
    
    @staticmethod
    def verify_project_milestone(project_id: str, milestone_id: str, review_data: AdminMilestoneReviewRequest, db: Session):
        from app.models.project import Milestone
        milestone = db.query(Milestone).filter(
            Milestone.id == milestone_id, 
            Milestone.project_id == project_id
        ).first()
        
        if not milestone:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Milestone not found for this project")
            
        milestone.status = review_data.status
        db.commit()
        db.refresh(milestone)
        return {"success": True, "milestone_id": milestone.id, "status": milestone.status}

    @staticmethod
    def update_project_status(project_id: str, status_data: AdminProjectStatusUpdateRequest, db: Session):
        from app.models.project import Project
        project = db.query(Project).filter(Project.id == project_id).first()
        
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
            
        project.status = status_data.status
        db.commit()
        db.refresh(project)
        return {"success": True, "project_id": project.id, "status": project.status}
