from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.schemas.auth import User
from app.schemas.project import ProjectCreate, ProjectListResponse, ProjectDetailResponse
from app.middleware.auth import get_builder_user
from app.services.project_service import ProjectService
from app.core.db import get_db

router = APIRouter(prefix="/projects", tags=["Real Estate Projects"])

@router.post("", response_model=ProjectDetailResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    project_data: ProjectCreate,
    current_builder: User = Depends(get_builder_user),
    db: Session = Depends(get_db)
):
    """
    Publish a new real estate project onto the platform.
    Requires an authenticated 'builder' role that has passed Admin 'approved' verification.
    """
    return ProjectService.create_project(current_builder.id, project_data, db)

@router.get("", response_model=List[ProjectListResponse])
def get_all_projects(
    lifecycle_status: str = 'active',
    db: Session = Depends(get_db)
):
    """
    Publicly fetch a list of available real estate properties.
    By default, only returns properties with an 'active' status.
    """
    return ProjectService.list_projects(db, status_filter=lifecycle_status)

@router.get("/{project_id}", response_model=ProjectDetailResponse)
def get_project_details(
    project_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Publicly fetch detailed information on a single project, including its fractional milestones.
    """
    return ProjectService.get_project_details(str(project_id), db)
