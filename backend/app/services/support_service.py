from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status
from app.models.support import SupportTicket
from app.models.user import User
from app.schemas.support import SupportTicketCreate, SupportTicketUpdate
from typing import List, Optional

class SupportService:
    @staticmethod
    def create_ticket(user_id: str, ticket_data: SupportTicketCreate, db: Session):
        new_ticket = SupportTicket(
            user_id=user_id,
            subject=ticket_data.subject,
            description=ticket_data.description,
            category=ticket_data.category
        )
        db.add(new_ticket)
        db.commit()
        db.refresh(new_ticket)
        return new_ticket

    @staticmethod
    def get_user_tickets(user_id: str, db: Session):
        return db.query(SupportTicket).filter(SupportTicket.user_id == user_id).order_by(SupportTicket.created_at.desc()).all()

    @staticmethod
    def get_all_tickets(db: Session, skip: int = 0, limit: int = 50, status_filter: Optional[str] = None):
        query = db.query(SupportTicket)
        if status_filter:
            query = query.filter(SupportTicket.status == status_filter)
        
        total = query.count()
        
        # Join with User to get email and name
        items_with_user = []
        tickets = query.order_by(SupportTicket.created_at.desc()).offset(skip).limit(limit).all()
        
        for ticket in tickets:
            # We add these attributes dynamically so Pydantic can pick them up
            ticket.user_email = ticket.user.email
            ticket.user_name = f"{ticket.user.first_name or ''} {ticket.user.last_name or ''}".strip() or "Anonymous"
            items_with_user.append(ticket)
        
        return {"items": items_with_user, "total": total}

    def update_ticket(ticket_id: str, update_data: SupportTicketUpdate, db: Session):
        ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
        if not ticket:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")
        
        if update_data.status:
            ticket.status = update_data.status
        if update_data.priority:
            ticket.priority = update_data.priority
        if update_data.admin_notes is not None: # Allow clearing with empty string
            ticket.admin_notes = update_data.admin_notes
            
        db.commit()
        db.refresh(ticket)
        
        # Add user info for the response
        ticket.user_email = ticket.user.email
        ticket.user_name = f"{ticket.user.first_name or ''} {ticket.user.last_name or ''}".strip() or "Anonymous"
        
        return ticket
