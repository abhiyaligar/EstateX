from fastapi import APIRouter, Depends, Query, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.schemas.auth import User
from app.schemas.exchange import OrderCreate, OrderResponse, BrickHoldingResponse, PublicOrderResponse
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
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Push intent into the Secondary Orderbook!
    Strictly mathematically trapped by +20% / -10% circuit breakers.
    Returns instantly; matching logic happens in a background worker.
    """
    new_order = ExchangeService.place_order(current_user.id, order_data, db)
    
    # Fire the matching engine in a background task for sub-100ms response time
    background_tasks.add_task(ExchangeService.run_matching_engine, new_order.id)
    
    return new_order

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
    return db.query(Trade).filter(Trade.project_id == str(project_id)).order_by(Trade.executed_at.desc()).limit(5).all()

@router.get("/orders/public/{project_id}", response_model=List[PublicOrderResponse])
def get_public_order_book(
    project_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Exposes ALL open buy/sell intents for a project!
    Used to build the live 'Depth' or 'Order Book' visualization.
    """
    return db.query(Order).filter(
        Order.project_id == str(project_id),
        Order.status.in_(['open', 'partial'])
    ).order_by(Order.price_per_brick.desc()).all()

@router.post("/orders/{order_id}/cancel")
def cancel_order(
    order_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Withdraws an active intent and returns locked assets (Fiat/Bricks) to the user.
    """
    return ExchangeService.cancel_order(str(current_user.id), str(order_id), db)

from app.schemas.exchange import OHLCVResponse
from sqlalchemy import func
from datetime import timedelta

@router.get("/trades/{project_id}/ohlcv", response_model=List[OHLCVResponse])
def get_project_ohlcv(
    project_id: UUID,
    interval: str = Query('1h', description="Time interval: 1m, 5m, 1h, 1d"),
    db: Session = Depends(get_db)
):
    """
    Returns aggregated OHLCV data for advanced charting.
    Note: For a production app, this would use timescaleDB or a materialized view.
    Here we do a simple python-side aggregation for demonstration.
    """
    # Fetch trades ordered by time
    trades = db.query(Trade).filter(Trade.project_id == str(project_id)).order_by(Trade.executed_at.asc()).all()
    
    if not trades:
        return []

    # Map intervals to pandas-like frequency or simple timedelta
    interval_map = {
        '1m': timedelta(minutes=1),
        '5m': timedelta(minutes=5),
        '1h': timedelta(hours=1),
        '1d': timedelta(days=1)
    }
    td = interval_map.get(interval, timedelta(hours=1))
    
    ohlcv_data = {}
    
    for trade in trades:
        # Floor the timestamp to the nearest interval
        # E.g., for 1h: 14:35 -> 14:00
        timestamp = trade.executed_at.timestamp()
        interval_seconds = td.total_seconds()
        bucket = int(timestamp // interval_seconds) * interval_seconds
        
        price = float(trade.price)
        qty = trade.quantity
        
        if bucket not in ohlcv_data:
            ohlcv_data[bucket] = {
                'time': int(bucket),
                'open': price,
                'high': price,
                'low': price,
                'close': price,
                'value': qty
            }
        else:
            ohlcv_data[bucket]['high'] = max(ohlcv_data[bucket]['high'], price)
            ohlcv_data[bucket]['low'] = min(ohlcv_data[bucket]['low'], price)
            ohlcv_data[bucket]['close'] = price
            ohlcv_data[bucket]['value'] += qty
            
    return sorted(list(ohlcv_data.values()), key=lambda x: x['time'])
