from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.schemas.auth import User
from app.schemas.exchange import OrderCreate, OrderResponse, BrickHoldingResponse
from app.models.portfolio import BrickHolding
from app.models.exchange import Order
from app.middleware.auth import get_current_user
from app.services.exchange_service import ExchangeService
from app.core.db import get_db

router = APIRouter(prefix="/exchange", tags=["Stock Broker Exchange"])

@router.post("/ipo/{project_id}/subscribe")
def subscribe_to_primary_ipo(
    project_id: UUID,
    quantity: int = Query(..., gt=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Direct primary market purchase. Exclusively maps real-world fiat directly to real-estate Bricks from the Builder's internal supply. 
    """
    return ExchangeService.subscribe_to_ipo(current_user.id, str(project_id), quantity, db)

@router.post("/orders", response_model=OrderResponse)
def place_secondary_market_order(
    order_data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Push intent into the Secondary Orderbook!
    Strictly mathematically trapped by +20% / -10% circuit breakers and instantly spawns matches against existing liquidity.
    """
    return ExchangeService.place_order(current_user.id, order_data, db)

@router.get("/portfolio", response_model=List[BrickHoldingResponse])
def get_investor_holdings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Displays the user's legally backed Equity (Bricks) inside various Real Estate Projects!
    """
    return db.query(BrickHolding).filter(BrickHolding.user_id == current_user.id).all()

@router.get("/orders", response_model=List[OrderResponse])
def get_my_open_market_intents(
    status: str = Query('open', description="Filter open/fulfilled/cancelled intents"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Lists the current user's outstanding intent to purchase or liquidate assets.
    """
    return db.query(Order).filter(Order.user_id == current_user.id, Order.status == status).order_by(Order.created_at.desc()).all()

from app.schemas.exchange import TradeResponse
from app.models.exchange import Trade
@router.get("/trades/{project_id}", response_model=List[TradeResponse])
def get_project_trade_history(
    project_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Publicly tracks transparent historical matches shifting the underlying market_value ticker.
    """
    return db.query(Trade).filter(Trade.project_id == str(project_id)).order_by(Trade.executed_at.desc()).limit(50).all()
