from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.schemas.auth import User
from app.schemas.support import SupportTicketCreate, SupportTicketResponse, SupportTicketListResponse, SupportTicketUpdate
from app.middleware.auth import get_current_user, get_admin_user
from app.services.support_service import SupportService
from app.core.db import get_db

router = APIRouter(prefix="/support", tags=["Institutional Support"])

@router.post("/tickets", response_model=SupportTicketResponse)
def create_ticket(
    ticket_data: SupportTicketCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Raise a new institutional support ticket."""
    return SupportService.create_ticket(str(current_user.id), ticket_data, db)

@router.get("/tickets", response_model=List[SupportTicketResponse])
def list_my_tickets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Synchronize with your raised support nodes."""
    return SupportService.get_user_tickets(str(current_user.id), db)

# --- Admin Management Endpoints ---

@router.get("/admin/tickets", response_model=SupportTicketListResponse)
def admin_list_tickets(
    status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Institutional Audit: List all support tickets across the platform."""
    return SupportService.get_all_tickets(db, skip=skip, limit=limit, status_filter=status)

@router.put("/admin/tickets/{ticket_id}", response_model=SupportTicketResponse)
def admin_update_ticket(
    ticket_id: str,
    update_data: SupportTicketUpdate,
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Administrative Node: Update ticket status, priority, or notes."""
    return SupportService.update_ticket(ticket_id, update_data, db)
