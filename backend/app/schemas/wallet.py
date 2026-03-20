from pydantic import BaseModel, condecimal
from typing import List, Optional
from datetime import datetime
from uuid import UUID

class TransactionBase(BaseModel):
    id: UUID
    amount: condecimal(max_digits=18, decimal_places=2) # type: ignore
    transaction_type: str
    status: str
    reference_id: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class WalletDepositRequest(BaseModel):
    amount: condecimal(max_digits=18, decimal_places=2, gt=0) # type: ignore
    reference_id: Optional[str] = None

class WalletWithdrawRequest(BaseModel):
    amount: condecimal(max_digits=18, decimal_places=2, gt=0) # type: ignore

class AdminWalletAdjustmentRequest(BaseModel):
    amount: condecimal(max_digits=18, decimal_places=2) # type: ignore
    reason: str

class WalletBalanceResponse(BaseModel):
    balance: condecimal(max_digits=18, decimal_places=2) # type: ignore
    recent_transactions: List[TransactionBase]

    class Config:
        from_attributes = True
