from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from decimal import Decimal
from app.models.user import User
from app.models.wallet import WalletTransaction
from app.schemas.wallet import WalletDepositRequest, WalletWithdrawRequest, AdminWalletAdjustmentRequest

class WalletService:
    @staticmethod
    def get_wallet_context(user_id: str, db: Session):
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
            
        transactions = db.query(WalletTransaction)\
            .filter(WalletTransaction.user_id == user_id, WalletTransaction.is_builder_transaction == False)\
            .order_by(WalletTransaction.created_at.desc())\
            .limit(10).all()
            
        return {"balance": user.wallet_balance or Decimal("0.00"), "recent_transactions": transactions}
        
    @staticmethod
    def get_builder_wallet_context(user_id: str, db: Session):
        from app.models.builder import Builder
        builder = db.query(Builder).filter(Builder.id == user_id).first()
        if not builder:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Builder profile not found")
            
        transactions = db.query(WalletTransaction)\
            .filter(WalletTransaction.user_id == user_id, WalletTransaction.is_builder_transaction == True)\
            .order_by(WalletTransaction.created_at.desc())\
            .limit(10).all()
            
        return {"balance": builder.wallet_balance or Decimal("0.00"), "recent_transactions": transactions}

    @staticmethod
    def process_deposit(user_id: str, deposit_data: WalletDepositRequest, db: Session):
        user = db.query(User).filter(User.id == user_id).with_for_update().first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
            
        # Securely add funds
        user.wallet_balance += Decimal(str(deposit_data.amount))
        
        trx = WalletTransaction(
            user_id=user_id,
            amount=deposit_data.amount,
            transaction_type="deposit",
            reference_id=deposit_data.reference_id,
            status="completed"
        )
        db.add(trx)
        db.commit()
        db.refresh(trx)
        return trx

    @staticmethod
    def process_withdrawal(user_id: str, withdraw_data: WalletWithdrawRequest, db: Session):
        user = db.query(User).filter(User.id == user_id).with_for_update().first()
        
        withdraw_amount = Decimal(str(withdraw_data.amount))
        if user.wallet_balance < withdraw_amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Insufficient wallet balance"
            )
            
        user.wallet_balance -= withdraw_amount
        
        trx = WalletTransaction(
            user_id=user_id,
            amount=-withdraw_amount, # Store as negative value for outbound
            transaction_type="withdrawal",
            status="completed" # Real systems might set to 'pending' until bank clears
        )
        db.add(trx)
        db.commit()
        db.refresh(trx)
        return trx

    @staticmethod
    def admin_adjust_balance(user_id: str, adjust_data: AdminWalletAdjustmentRequest, db: Session):
        user = db.query(User).filter(User.id == user_id).with_for_update().first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
            
        adjustment_amount = Decimal(str(adjust_data.amount))
        user.wallet_balance += adjustment_amount
        
        trx = WalletTransaction(
            user_id=user_id,
            amount=adjustment_amount,
            transaction_type="admin_adjustment",
            reference_id=adjust_data.reason,
            status="completed"
        )
        db.add(trx)
        db.commit()
        db.refresh(trx)
        return {"success": True, "new_balance": user.wallet_balance, "transaction_id": trx.id}

    @staticmethod
    def process_builder_withdrawal(user_id: str, withdraw_data: WalletWithdrawRequest, db: Session):
        from app.models.builder import Builder
        builder = db.query(Builder).filter(Builder.id == user_id).with_for_update().first()
        if not builder:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Builder profile not found")
        
        # SIMULATED OTP Logic
        if not withdraw_data.reference_id or withdraw_data.reference_id != "123456":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="INVALID OTP. Please use the simulated 123456 for this request."
            )

        withdraw_amount = Decimal(str(withdraw_data.amount))
        if builder.wallet_balance < withdraw_amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Insufficient business balance"
            )
            
        builder.wallet_balance -= withdraw_amount
        
        trx = WalletTransaction(
            user_id=user_id,
            amount=-withdraw_amount,
            transaction_type="withdrawal",
            is_builder_transaction=True, # BUSINESS TRANSACTION
            status="completed"
        )
        db.add(trx)
        db.commit()
        db.refresh(trx)
        return trx
