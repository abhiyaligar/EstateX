from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status
from app.models.user import User as DBUser
from app.models.kyc import KYCRecord
from app.models.project import Project
from app.schemas.admin import (
    DashboardStatsResponse, KYCReviewRequest, 
    AdminMilestoneReviewRequest, AdminProjectStatusUpdateRequest
)

class AdminService:
    @staticmethod
    def get_dashboard_stats(db: Session) -> DashboardStatsResponse:
        # Group users by their specific roles
        role_counts = dict(
            db.query(DBUser.role, func.count(DBUser.id))
            .group_by(DBUser.role)
            .all()
        )
        
        total_users = sum(role_counts.values())
        
        pending_kyc = db.query(func.count(KYCRecord.id)).filter(
            KYCRecord.status.in_(['pending', 'otp_verified']) 
            if hasattr(KYCRecord, 'status') else True
        ).scalar() or 0

        from app.models.builder import Builder
        pending_builders = db.query(func.count(Builder.id)).filter(Builder.verification_status == 'pending').scalar() or 0

        # Live Project Stats
        projects_active = db.query(func.count(Project.id)).filter(Project.status == 'approved').scalar() or 0
        projects_completed = db.query(func.count(Project.id)).filter(Project.ipo_status == 'completed').scalar() or 0
        total_investments_locked_inr = db.query(func.sum(Project.funding_raised)).scalar() or 0.0
        total_platform_escrow = db.query(func.sum(Project.total_escrow_held)).scalar() or 0.0
        
        return DashboardStatsResponse(
            total_users=total_users,
            total_investors=role_counts.get('investor', 0),
            total_builders=role_counts.get('builder', 0),
            total_admins=role_counts.get('admin', 0),
            kyc_pending_approvals=pending_kyc,
            builder_pending_approvals=pending_builders,
            projects_active=projects_active,
            projects_completed=projects_completed,
            total_investments_locked_inr=float(total_investments_locked_inr),
            total_platform_escrow=float(total_platform_escrow)
        )

    @staticmethod
    def get_kyc_applications(
        db: Session, 
        status_filter: str = 'all', 
        assigned_admin_id: str = None,
        skip: int = 0, 
        limit: int = 50
    ):
        # Join with User table to get full_name
        query = db.query(
            KYCRecord,
            (DBUser.first_name + " " + DBUser.last_name).label("full_name")
        ).join(DBUser, KYCRecord.user_id == DBUser.id)
        
        if status_filter != 'all':
            query = query.filter(KYCRecord.status == status_filter)
        else:
            query = query.filter(KYCRecord.status.in_(['pending', 'otp_verified', 'approved']))

        if assigned_admin_id:
            query = query.filter(KYCRecord.assigned_admin_id == assigned_admin_id)
            
        total = query.count()
        results = query.order_by(KYCRecord.updated_at.asc()).offset(skip).limit(limit).all()
        
        items = []
        for kyc, full_name in results:
            # Add full_name to the kyc object dynamically for the schema dump
            kyc.full_name = full_name if full_name and full_name.strip() else "Unknown Subject"
            items.append(kyc)
        
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
        from app.models.project import Milestone, Project
        from app.models.wallet import WalletTransaction
        from decimal import Decimal

        project = db.query(Project).filter(Project.id == project_id).with_for_update().first()
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

        milestone = db.query(Milestone).filter(
            Milestone.id == milestone_id, 
            Milestone.project_id == project_id
        ).with_for_update().first()
        
        if not milestone:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Milestone not found for this project")
        
        if milestone.status == 'completed' and review_data.status == 'completed':
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Milestone already verified and funds released.")
            
        old_status = milestone.status
        milestone.status = review_data.status
        
        # Financial Release Logic: If milestone marked as 'completed', move funds from Escrow to Builder
        if review_data.status == 'completed' and old_status != 'completed':
            # Calculate payout: Percentage of funding_raised currently held in escrow
            payout_amount = (Decimal(str(milestone.release_percentage)) / Decimal('100.0')) * (project.funding_raised or Decimal('0.0'))
            
            current_escrow = project.total_escrow_held or Decimal('0.0')
            if current_escrow < payout_amount:
                # Safety check: should not happen if accounting is correct
                payout_amount = current_escrow
                
            project.total_escrow_held = current_escrow - payout_amount
        
            # Find the Builder profile (Business Wallet) and credit it
            from app.models.builder import Builder
            builder_profile = db.query(Builder).filter(Builder.id == project.builder_id).with_for_update().first()
            if builder_profile:
                builder_profile.wallet_balance += payout_amount
                
                # Log Transactions
                # 1. Admin/Escrow Release (Tagged for Builder Wallet)
                db.add(WalletTransaction(
                    user_id=builder_profile.id, 
                    amount=payout_amount,
                    transaction_type='milestone_payout',
                    is_builder_transaction=True, # STRICT SEPARATION
                    status='completed',
                    reference_id=f"MS-REL-{milestone.id}"
                ))
            
        db.commit()
        db.refresh(milestone)
        return {"success": True, "milestone_id": milestone.id, "status": milestone.status, "payout_executed": True if review_data.status == 'completed' else False}

    @staticmethod
    def update_project_status(project_id: str, status_data: AdminProjectStatusUpdateRequest, db: Session):
        from app.models.project import Project
        from app.models.exchange import Order
        from app.services.exchange_service import ExchangeService
        
        project = db.query(Project).filter(Project.id == project_id).first()
        
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
            
        old_status = project.status
        project.status = status_data.status
        
        # If transitioning to HALTED, mathematically purge the order book to protect users
        if status_data.status == 'halted' and old_status != 'halted':
            # Find all open/partial orders for this project
            open_orders = db.query(Order).filter(
                Order.project_id == project_id,
                Order.status.in_(['open', 'partial'])
            ).all()
            
            for order in open_orders:
                # We use the existing cancellation logic to ensure atomicity and proper asset refunding
                ExchangeService.cancel_order(str(order.user_id), str(order.id), db)
        
        db.commit()
        db.refresh(project)
        return {
            "success": True, 
            "project_id": project.id, 
            "status": project.status, 
            "orders_cancelled": True if status_data.status == 'halted' else False
        }
