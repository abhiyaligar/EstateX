import uuid
from sqlalchemy import Column, Integer, String, DECIMAL, ForeignKey, DateTime, Date, Boolean, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.user import Base
import datetime

class Order(Base):
    """
    Captures raw secondary market intents (Buy Limit/Market, Sell Limit/Market).
    Orders remain 'open' waiting for the matching engine to pair them against inverse liquidity.
    """
    __tablename__ = 'orders'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    project_id = Column(UUID(as_uuid=True), ForeignKey('projects.id', ondelete='CASCADE'), nullable=False, index=True)
    
    order_type = Column(String(20), nullable=False, index=True) # 'buy' or 'sell'
    execution_type = Column(String(20), default='limit', nullable=False) # 'limit' or 'market'
    
    price_per_brick = Column(DECIMAL(18, 2), nullable=True)
    quantity = Column(Integer, nullable=False)
    unfilled_quantity = Column(Integer, nullable=False) # Starts equal to quantity. Depletes to 0 upon fill.
    
    status = Column(String(50), default='open', index=True) # open, partial, fulfilled, cancelled, rejected
    
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class Trade(Base):
    """
    Immutable ledger of executed market transactions pairing specific Buyers against Sellers.
    This dictates the 'latest closing price' pushing the Project's dynamically floating market_value!
    """
    __tablename__ = 'trades'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    project_id = Column(UUID(as_uuid=True), ForeignKey('projects.id', ondelete='CASCADE'), nullable=False, index=True)
    
    buyer_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    seller_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    
    buy_order_id = Column(UUID(as_uuid=True), ForeignKey('orders.id', ondelete='CASCADE'), nullable=False)
    sell_order_id = Column(UUID(as_uuid=True), ForeignKey('orders.id', ondelete='CASCADE'), nullable=False)
    
    price = Column(DECIMAL(18, 2), nullable=False) # The agreed crossing price where the engine locked the bounds
    quantity = Column(Integer, nullable=False)
    
    executed_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, index=True)


class DailyCandle(Base):
    """
    Pre-computed OHLCV candle per project per calendar day (IST).

    Lifecycle:
      - Created at 12:00 AM IST by open_daily_candles() scheduler job.
      - open_price is frozen at creation and NEVER changes — circuit breaker anchors to it.
      - high / low / close / volume are updated live on every trade execution.
      - Finalized at 11:59 PM IST by close_daily_candles() scheduler job.
    """
    __tablename__ = 'daily_candles'
    __table_args__ = (
        UniqueConstraint('project_id', 'date', name='uq_daily_candle_project_date'),
    )

    id           = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    project_id   = Column(UUID(as_uuid=True), ForeignKey('projects.id', ondelete='CASCADE'), nullable=False, index=True)
    date         = Column(Date, nullable=False, index=True)  # Calendar date in IST

    open_price   = Column(DECIMAL(18, 2), nullable=False)    # Frozen at session open — circuit breaker base
    high_price   = Column(DECIMAL(18, 2), nullable=False)    # Updated live on each trade
    low_price    = Column(DECIMAL(18, 2), nullable=False)    # Updated live on each trade
    close_price  = Column(DECIMAL(18, 2), nullable=False)    # Rolling last trade price
    volume       = Column(Integer, default=0, nullable=False) # Total bricks traded today

    is_finalized = Column(Boolean, default=False, nullable=False)  # True after 11:59 PM job runs

    created_at   = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at   = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

