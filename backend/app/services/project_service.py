from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Optional
from uuid import UUID
from app.models.project import Project, Milestone
from app.models.builder import Builder
from app.schemas.project import ProjectCreate
import datetime

class ProjectService:
    @staticmethod
    def create_project(builder_id: str, project_data: ProjectCreate, db: Session, image_urls: List[str] = None) -> Project:
        # Verify the Builder exists and is officially 'approved' by an Admin
        builder = db.query(Builder).filter(Builder.id == builder_id).first()
        
        if not builder:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Builder profile not found. Please complete accreditation first."
            )

        if builder.verification_status != 'approved':
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Property listing restricted. Your builder accreditation is still pending or requires revision."
            )
            
        # Validate milestones sum to exactly 100%
        total_percentage = sum(m.release_percentage for m in project_data.milestones)
        if total_percentage != 100.0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Milestone release percentages must total exactly 100.0%. Current total: {total_percentage}%"
            )

        # Create Core Project Entity (IPO Structure)
        new_project = Project(
            builder_id=builder_id,
            title=project_data.title,
            description=project_data.description,
            location_address=project_data.location_address,
            city=project_data.city,
            state=project_data.state,
            pincode=project_data.pincode,
            total_budget=project_data.total_budget,
            
            # Brick Logistics
            total_bricks=project_data.total_bricks,
            face_value=project_data.face_value,
            ipo_price=project_data.ipo_price,
            market_value=project_data.ipo_price, # Starts pegged precisely to the IPO benchmark
            
            # Property Attributes
            property_type=project_data.property_type,
            area_sqft=project_data.area_sqft,
            bedroom_count=project_data.bedroom_count,
            bathroom_count=project_data.bathroom_count,
            
            # Compliance
            rera_id=project_data.rera_id,
            rera_approved=project_data.rera_approved,
            environmental_clearance=project_data.environmental_clearance,
            insurance_coverage=project_data.insurance_coverage,
            rera_approval_url=project_data.rera_approval_url,
            brochure_url=project_data.brochure_url,
            
            expected_completion_date=project_data.expected_completion_date,
            images=image_urls or [],
            ipo_status='upcoming', 
            status='active' # Visible for browsing
        )
        db.add(new_project)
        db.flush() # Flush to generate the project's UUID for the milestones

        # Attach nested Milestones
        for index, milestone_data in enumerate(project_data.milestones):
            new_milestone = Milestone(
                project_id=new_project.id,
                milestone_number=milestone_data.milestone_number,
                description=milestone_data.description,
                target_date=milestone_data.target_date,
                release_percentage=milestone_data.release_percentage,
                status='pending'
            )
            db.add(new_milestone)
            
        db.commit()
        db.refresh(new_project)
        return new_project

    @staticmethod
    def list_projects(db: Session, status_filter: str = 'active', builder_id: Optional[UUID] = None) -> List[Project]:
        query = db.query(Project)
        if status_filter != 'all':
            query = query.filter(Project.status == status_filter)
        if builder_id:
            query = query.filter(Project.builder_id == builder_id)
        return query.order_by(Project.created_at.desc()).all()

    @staticmethod
    def get_project_details(project_id: str, db: Session) -> Project:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        return project
