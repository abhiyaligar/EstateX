import uuid
from sqlalchemy import Column, String, DECIMAL, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.user import Base
import datetime

class WalletTransaction(Base):
    __tablename__ = 'wallet_transactions'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    
    amount = Column(DECIMAL(18, 2), nullable=False)
    transaction_type = Column(String(50), nullable=False, index=True) # deposit, withdrawal, admin_adjustment, brick_purchase, brick_sale
    status = Column(String(50), default='completed') # pending, completed, failed
    
    # E.g. Stripe checkout ID, or Admin's descriptive adjustment reason
    reference_id = Column(String(255))
    
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)

    # Note: We aren't explicitly forcing a heavily loaded back_populate on User for transactions 
    # to avoid blowing up memory bounds, but the FK exists physically.
