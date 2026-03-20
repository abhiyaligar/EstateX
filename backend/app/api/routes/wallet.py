from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.auth import User
from app.schemas.wallet import WalletBalanceResponse, WalletDepositRequest, WalletWithdrawRequest, TransactionBase
from app.middleware.auth import get_current_user
from app.services.wallet_service import WalletService
from app.core.db import get_db

router = APIRouter(prefix="/wallet", tags=["User Wallet"])

@router.get("", response_model=WalletBalanceResponse)
def get_my_wallet(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Fetch your liquid Fiat wallet balance and 10 most recent ledger transactions."""
    return WalletService.get_wallet_context(current_user.id, db)

@router.post("/deposit", response_model=TransactionBase)
def deposit_funds(
    deposit_data: WalletDepositRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Instantly inject external Fiat into your internal EstateX Wallet."""
    return WalletService.process_deposit(current_user.id, deposit_data, db)

@router.post("/withdraw", response_model=TransactionBase)
def withdraw_funds(
    withdraw_data: WalletWithdrawRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Securely extract internal Fiat back to your external bank accounts."""
    return WalletService.process_withdrawal(current_user.id, withdraw_data, db)
