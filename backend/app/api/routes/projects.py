from fastapi import APIRouter, Depends, status, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
import json
from app.schemas.auth import User
from app.schemas.project import ProjectCreate, ProjectListResponse, ProjectDetailResponse
from app.middleware.auth import get_builder_user
from app.services.project_service import ProjectService
from app.utils.storage import upload_file_to_s3
from app.core.db import get_db

router = APIRouter(prefix="/projects", tags=["Real Estate Projects"])

@router.post("", response_model=ProjectDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: str = Form(...),
    images: List[UploadFile] = File(...),
    current_builder: User = Depends(get_builder_user),
    db: Session = Depends(get_db)
):
    """
    Publish a new real estate project onto the platform with images.
    Requires an authenticated 'builder' role that has passed Admin 'approved' verification.
    The 'project_data' field must be a JSON string matching the ProjectCreate schema.
    """
    # Parse the JSON project data
    try:
        project_dict = json.loads(project_data)
        validated_data = ProjectCreate(**project_dict)
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid project data format: {str(e)}"
        )
        
    # Upload images to S3
    image_urls = []
    for image in images:
        content = await image.read()
        url = await upload_file_to_s3(content, image.filename, image.content_type)
        image_urls.append(url)
        
    return ProjectService.create_project(current_builder.id, validated_data, db, image_urls=image_urls)

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
