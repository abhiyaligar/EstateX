from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.revenue import RentalCycle, RentalPayout
from app.models.exchange import Trade
from app.models.portfolio import BrickHolding
from app.models.wallet import WalletTransaction
from app.models.project import Project
from app.models.user import User
from app.models.builder import Builder
from fastapi import HTTPException, status
import datetime
from decimal import Decimal

class RevenueService:
    @staticmethod
    def calculate_mature_holdings(db: Session, user_id: str, project_id: str, cutoff_date: datetime.datetime):
        """
        Logic: Only pay rental on bricks held for > 30 days.
        1. Fetch all BUY trades for the user in this project.
        2. Fetch all SELL trades (to account for FIFO depletion).
        3. Bricks bought before (cutoff_date - 30 days) are mature.
        """
        # TEMPORARY: Set to 0 days for testing. Change back to 30 for production.
        maturity_threshold = cutoff_date - datetime.timedelta(days=0)
        
        # 1. Total current bricks
        current_holding = db.query(BrickHolding).filter(
            BrickHolding.user_id == user_id,
            BrickHolding.project_id == project_id
        ).first()
        
        if not current_holding or current_holding.quantity <= 0:
            return 0
            
        total_quantity = current_holding.quantity
        
        # 2. Reconstruct FIFO to see which bricks are 'old'
        # Get all buys
        buys = db.query(Trade).filter(
            Trade.buyer_id == user_id,
            Trade.project_id == project_id
        ).order_by(Trade.executed_at.asc()).all()
        
        # Get all sells
        sells = db.query(Trade).filter(
            Trade.seller_id == user_id,
            Trade.project_id == project_id
        ).order_by(Trade.executed_at.asc()).all()
        
        total_sold = sum(s.quantity for s in sells)
        
        mature_quantity = 0
        consumed_sold = total_sold
        
        for buy in buys:
            buy_qty = buy.quantity
            
            # If we sold bricks, they come out of the oldest buys first (FIFO)
            if consumed_sold > 0:
                if consumed_sold >= buy_qty:
                    consumed_sold -= buy_qty
                    buy_qty = 0
                else:
                    buy_qty -= consumed_sold
                    consumed_sold = 0
            
            if buy_qty > 0 and buy.executed_at <= maturity_threshold:
                mature_quantity += buy_qty
                
        # Mature quantity cannot exceed current total (safety check)
        return min(mature_quantity, total_quantity)

    @staticmethod
    def initiate_rental_cycle(db: Session, project_id: str, amount: Decimal, month: int, year: int):
        # 1% Fee calculation
        fee = amount * Decimal('0.01')
        net = amount - fee
        
        cycle = RentalCycle(
            project_id=project_id,
            month=month,
            year=year,
            gross_amount=amount,
            fee_amount=fee,
            net_amount=net,
            status='pending_approval'
        )
        
        db.add(cycle)
        db.commit()
        db.refresh(cycle)
        return cycle

    @staticmethod
    def settle_revenue_cycle(db: Session, cycle_id: str, admin_id: str):
        cycle = db.query(RentalCycle).filter(RentalCycle.id == cycle_id).first()
        if not cycle:
            raise HTTPException(status_code=404, detail="Cycle not found")
        
        if cycle.status == 'settled':
            raise HTTPException(status_code=400, detail="Cycle already settled")
            
        project = db.query(Project).filter(Project.id == cycle.project_id).first()
        
        # --- NEW SAFETY CHECK: Calculate eligibility BEFORE moving any money ---
        holders = db.query(BrickHolding).filter(BrickHolding.project_id == project.id).all()
        eligible_holders = []
        total_eligible_bricks = 0
        cutoff = datetime.datetime.utcnow()
        
        for h in holders:
            mature_qty = RevenueService.calculate_mature_holdings(db, h.user_id, h.project_id, cutoff)
            if mature_qty > 0:
                eligible_holders.append({'user_id': h.user_id, 'qty': mature_qty})
                total_eligible_bricks += mature_qty
                
        if total_eligible_bricks == 0:
            raise HTTPException(
                status_code=400, 
                detail="Settlement Aborted: No investors are currently eligible (must hold bricks > 0 days). Money was NOT deducted."
            )
        # -----------------------------------------------------------------------

        # 1. Deduct Gross from Builder Wallet (Business Ledger)
        builder_profile = db.query(Builder).filter(Builder.id == project.builder_id).first()
        if not builder_profile:
             raise HTTPException(status_code=404, detail="Builder profile not found")

        if builder_profile.wallet_balance < cycle.gross_amount:
             raise HTTPException(status_code=400, detail="Insufficient funds in builder business wallet")
             
        builder_profile.wallet_balance -= cycle.gross_amount
        
        # Create Builder Debit Transaction
        db.add(WalletTransaction(
            user_id=builder_profile.id, # Builder ID is the same as User ID
            amount=-cycle.gross_amount,
            transaction_type='rental_payout_debit',
            is_builder_transaction=True,
            reference_id=str(cycle.id)
        ))
        
        # 2. Platform Fee (Credit to Admin)
        admin = db.query(User).filter(User.id == admin_id).first()
        admin.wallet_balance += cycle.fee_amount
        db.add(WalletTransaction(
            user_id=admin.id,
            amount=cycle.fee_amount,
            transaction_type='platform_fee_credit',
            reference_id=str(cycle.id)
        ))
        
        # 3. Pro-rata Distribution to Mature Holders
        price_per_mature_brick = cycle.net_amount / Decimal(total_eligible_bricks)
        
        for eh in eligible_holders:
            payout_amt = Decimal(eh['qty']) * price_per_mature_brick
            
            # Credit Investor
            investor = db.query(User).filter(User.id == eh['user_id']).first()
            investor.wallet_balance += payout_amt
            
            db.add(WalletTransaction(
                user_id=investor.id,
                amount=payout_amt,
                transaction_type='rental_income_credit',
                reference_id=str(cycle.id)
            ))
            
            # Record Payout
            db.add(RentalPayout(
                cycle_id=cycle.id,
                user_id=eh['user_id'],
                eligible_quantity=eh['qty'],
                amount_paid=payout_amt
            ))
        
        cycle.status = 'settled'
        cycle.admin_id = admin_id
        cycle.distributed_at = datetime.datetime.utcnow()
        
        db.commit()
        db.refresh(cycle)
        
        # Load payouts with user info for the frontend
        return {
            "cycle": cycle,
            "payouts": db.query(RentalPayout, User.first_name, User.last_name, User.email)
                       .join(User, RentalPayout.user_id == User.id)
                       .filter(RentalPayout.cycle_id == cycle.id).all()
        }
