from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.auth import User
from app.schemas.wallet import WalletBalanceResponse, WalletDepositRequest, WalletWithdrawRequest, TransactionBase, WalletWithdrawVerifyRequest
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

@router.post("/withdraw/init")
def initiate_withdraw(
    withdraw_data: WalletWithdrawRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Initiates a withdrawal by sending an OTP to the user's email."""
    return WalletService.initiate_withdrawal(current_user.id, withdraw_data, db)

@router.post("/withdraw/verify", response_model=TransactionBase)
def withdraw_funds(
    verify_data: WalletWithdrawVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Securely extract internal Fiat back to your external bank accounts after verifying OTP."""
    return WalletService.process_withdrawal(current_user.id, verify_data, db)

@router.get("/builder", response_model=WalletBalanceResponse)
def get_builder_wallet(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Fetch builder-specific business balance and recent construction earnings."""
    return WalletService.get_builder_wallet_context(current_user.id, db)

@router.post("/builder/withdraw/init")
def initiate_builder_withdraw(
    withdraw_data: WalletWithdrawRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Initiates a business withdrawal by sending an OTP to the builder's email."""
    return WalletService.initiate_builder_withdrawal(current_user.id, withdraw_data, db)

@router.post("/builder/withdraw/verify", response_model=TransactionBase)
def withdraw_builder_funds(
    verify_data: WalletWithdrawVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Securely extract construction revenue from business wallet after verifying OTP."""
    return WalletService.process_builder_withdrawal(current_user.id, verify_data, db)
