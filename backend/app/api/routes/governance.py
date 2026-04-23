from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.db import get_db
from app.middleware.auth import get_current_user, get_admin_user, get_investor_user
from app.models.governance import GovernanceProposal, ProposalVote
from app.models.portfolio import BrickHolding
from app.models.project import Project
from app.schemas.governance import ProposalCreate, ProposalResponse, VoteCreate, VoteResponse
from app.schemas.auth import User
from sqlalchemy import func
import datetime

router = APIRouter(prefix="/governance", tags=["Governance"])

# --- Investor Routes ---

@router.get("/proposals/{project_id}", response_model=List[ProposalResponse])
def get_proposals(project_id: str, db: Session = Depends(get_db)):
    """
    Fetch all proposals for a specific project.
    """
    proposals = db.query(GovernanceProposal).filter(GovernanceProposal.project_id == project_id).all()
    
    response = []
    for p in proposals:
        # Calculate distribution
        votes = db.query(ProposalVote).filter(ProposalVote.proposal_id == p.id).all()
        total_weight = sum(v.weight for v in votes)
        
        distribution = [0] * len(p.options)
        for v in votes:
            distribution[v.option_index] += v.weight
            
        res = ProposalResponse.from_orm(p)
        res.total_votes = total_weight
        res.vote_distribution = distribution
        response.append(res)
        
    return response

@router.post("/proposals/{proposal_id}/vote", response_model=VoteResponse)
def cast_vote(
    proposal_id: str, 
    vote_data: VoteCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_investor_user)
):
    """
    Cast a weighted vote on a proposal.
    """
    proposal = db.query(GovernanceProposal).filter(GovernanceProposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
        
    if proposal.status != 'active':
        raise HTTPException(status_code=400, detail="Proposal is no longer active")
        
    if proposal.end_date < datetime.datetime.now(datetime.timezone.utc):
        proposal.status = 'closed'
        db.commit()
        raise HTTPException(status_code=400, detail="Proposal has expired")

    # Check if already voted
    existing_vote = db.query(ProposalVote).filter(
        ProposalVote.proposal_id == proposal_id,
        ProposalVote.user_id == current_user.id
    ).first()
    if existing_vote:
        raise HTTPException(status_code=400, detail="You have already cast your vote for this proposal")

    # Calculate weight (Snapshot of current holding)
    holding = db.query(BrickHolding).filter(
        BrickHolding.project_id == proposal.project_id,
        BrickHolding.user_id == current_user.id
    ).first()
    
    if not holding or holding.quantity <= 0:
        raise HTTPException(status_code=403, detail="Only brick holders of this project can vote")

    new_vote = ProposalVote(
        proposal_id=proposal_id,
        user_id=current_user.id,
        option_index=vote_data.option_index,
        weight=holding.quantity
    )
    
    db.add(new_vote)
    db.commit()
    db.refresh(new_vote)
    
    return new_vote

# --- Admin Routes ---

@router.get("/admin/proposals", response_model=List[ProposalResponse])
def get_all_proposals(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_admin_user)
):
    """
    Admin: Fetch all proposals across all projects.
    """
    proposals = db.query(GovernanceProposal).all()
    
    response = []
    for p in proposals:
        votes = db.query(ProposalVote).filter(ProposalVote.proposal_id == p.id).all()
        total_weight = sum(v.weight for v in votes)
        distribution = [0] * len(p.options)
        for v in votes:
            distribution[v.option_index] += v.weight
            
        res = ProposalResponse.from_orm(p)
        res.total_votes = total_weight
        res.vote_distribution = distribution
        response.append(res)
        
    return response

@router.post("/admin/proposals", response_model=ProposalResponse)
def create_proposal(
    proposal_data: ProposalCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_admin_user)
):
    """
    Admin: Initialize a new governance proposal for a project.
    """
    # Verify project exists and is completed (typically voting is for operational assets)
    project = db.query(Project).filter(Project.id == proposal_data.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    new_proposal = GovernanceProposal(
        project_id=proposal_data.project_id,
        title=proposal_data.title,
        description=proposal_data.description,
        options=proposal_data.options,
        end_date=proposal_data.end_date
    )
    
    db.add(new_proposal)
    db.commit()
    db.refresh(new_proposal)
    
    return ProposalResponse.from_orm(new_proposal)

@router.put("/admin/proposals/{proposal_id}/status", response_model=ProposalResponse)
def update_proposal_status(
    proposal_id: str,
    status: str,
    result_index: Optional[int] = None,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_admin_user)
):
    """
    Admin: Close or execute a proposal manually.
    """
    proposal = db.query(GovernanceProposal).filter(GovernanceProposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
        
    proposal.status = status
    if result_index is not None:
        proposal.result_option_index = result_index
        
    db.commit()
    db.refresh(proposal)
    return ProposalResponse.from_orm(proposal)
