from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from decimal import Decimal
from typing import List
from uuid import UUID

from app.models.user import User
from app.models.project import Project
from app.models.portfolio import BrickHolding
from app.models.exchange import Order, Trade
from app.models.wallet import WalletTransaction
from app.schemas.exchange import OrderCreate

from sqlalchemy import func

class ExchangeService:
    @staticmethod
    def subscribe_to_ipo(user_id: str, project_id: str, quantity: int, db: Session):
        """
        Primary Market: Investor buys Bricks directly from the Builder's IPO.
        """
        user = db.query(User).filter(User.id == user_id).with_for_update().first()
        project = db.query(Project).filter(Project.id == project_id).with_for_update().first()

        if not project or project.ipo_status != 'active':
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Project IPO is not active.")
        
        # Calculate exactly how many bricks are remaining
        sold_so_far = db.query(BrickHolding).filter(BrickHolding.project_id == project_id).with_entities(
            func.sum(BrickHolding.quantity)
        ).scalar() or 0
        
        if (sold_so_far + quantity) > project.total_bricks:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"IPO Sold Out! Only {project.total_bricks - sold_so_far} Bricks remaining.")
            
        total_cost = Decimal(str(quantity)) * project.ipo_price
        
        if user.wallet_balance < total_cost:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient Wallet Balance.")
            
        # Deduct fiat
        user.wallet_balance -= total_cost
        
        # Log transaction
        db.add(WalletTransaction(user_id=user.id, amount=-total_cost, transaction_type='brick_purchase', status='completed', reference_id=f"IPO-{project.id}"))
        
        # Add to Builder's funding raised
        project.funding_raised += total_cost
        
        # Allocate bricks natively to the investor's Portfolio
        holding = db.query(BrickHolding).filter(BrickHolding.user_id == user_id, BrickHolding.project_id == project_id).first()
        if holding:
            holding.quantity += quantity
        else:
            holding = BrickHolding(user_id=user_id, project_id=project_id, quantity=quantity)
            db.add(holding)
            
        db.commit()
        return {"success": True, "message": f"Successfully purchased {quantity} Bricks for {total_cost} INR."}

    @staticmethod
    def _enforce_circuit_breakers(project: Project, desired_price: Decimal):
        """
        Secondary Market: Mathematically clamps volatility. +20% / -10% from previous close.
        """
        base_price = project.previous_close_price or project.ipo_price
        
        max_allowed = base_price * Decimal('1.20')
        min_allowed = base_price * Decimal('0.90')
        
        if desired_price > max_allowed:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Upper Circuit Limit Hit. Max price allowed is {max_allowed}")
        if desired_price < min_allowed:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Lower Circuit Limit Hit. Min price allowed is {min_allowed}")

    @staticmethod
    def place_order(user_id: str, order_data: OrderCreate, db: Session):
        """
        Secondary Market: Submits an order intent, freezing required assets, and firing the Matching Engine.
        """
        project = db.query(Project).filter(Project.id == str(order_data.project_id)).first()
        if not project or project.ipo_status != 'completed':
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Project is not open for Secondary Market Trading.")
            
        ExchangeService._enforce_circuit_breakers(project, Decimal(str(order_data.price_per_brick)))
        
        order_type = order_data.order_type.lower()
        if order_type not in ['buy', 'sell']:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Order must be 'buy' or 'sell'.")
            
        user = db.query(User).filter(User.id == user_id).with_for_update().first()
        
        # 1. Escrow Assets (Mathematically strict pre-deduction)
        if order_type == 'buy':
            total_escrow_needed = Decimal(str(order_data.quantity)) * Decimal(str(order_data.price_per_brick))
            if user.wallet_balance < total_escrow_needed:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient Wallet Balance to lock Buy Order.")
            user.wallet_balance -= total_escrow_needed # Freeze Fiat
        else:
            holding = db.query(BrickHolding).filter(BrickHolding.user_id == user_id, BrickHolding.project_id == str(project.id)).with_for_update().first()
            if not holding or holding.quantity < order_data.quantity:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient Bricks in Portfolio to lock Sell Order.")
            holding.quantity -= order_data.quantity # Freeze Bricks
            
        # 2. Spawn Order
        new_order = Order(
            user_id=user_id,
            project_id=str(project.id),
            order_type=order_type,
            price_per_brick=Decimal(str(order_data.price_per_brick)),
            quantity=order_data.quantity,
            unfilled_quantity=order_data.quantity,
            status='open'
        )
        db.add(new_order)
        db.flush() # Secure UUID without committing entirely yet
        
        # 3. Fire Engine 
        ExchangeService._matching_engine(new_order.id, db)
        
        db.commit() # Globally commits the spawned order AND whatever trades the engine materialized automatically
        db.refresh(new_order)
        return new_order

    @staticmethod
    def _matching_engine(new_order_id: UUID, db: Session):
        """
        The brutal FIFO algorithmic core pairing matching liquidity and spawning Trade objects.
        """
        new_order = db.query(Order).filter(Order.id == new_order_id).first()
        
        # Seek counterparties
        counter_type = 'sell' if new_order.order_type == 'buy' else 'buy'
        
        # Standard FIFO + Price-Time Priority
        query = db.query(Order).filter(
            Order.project_id == new_order.project_id,
            Order.order_type == counter_type,
            Order.status.in_(['open', 'partial'])
        )
        
        if new_order.order_type == 'buy':
            # Buyer wants sellers offering <= their limit price, sorted by cheapest first, then oldest.
            query = query.filter(Order.price_per_brick <= new_order.price_per_brick)
            query = query.order_by(Order.price_per_brick.asc(), Order.created_at.asc())
        else:
            # Seller wants buyers offering >= their limit price, sorted by highest first, then oldest.
            query = query.filter(Order.price_per_brick >= new_order.price_per_brick)
            query = query.order_by(Order.price_per_brick.desc(), Order.created_at.asc())
            
        counter_orders = query.with_for_update().all()
        
        project = db.query(Project).filter(Project.id == new_order.project_id).first()
        
        for counter_order in counter_orders:
            if new_order.unfilled_quantity <= 0:
                break # Our order is fully filled
                
            trade_qty = min(new_order.unfilled_quantity, counter_order.unfilled_quantity)
            
            # The execution price mathematically defaults to the "Maker's" price (the order already sitting on the book)
            execution_price = counter_order.price_per_brick
            
            buyer = new_order.user_id if new_order.order_type == 'buy' else counter_order.user_id
            seller = counter_order.user_id if new_order.order_type == 'buy' else new_order.user_id
            
            buy_order = new_order if new_order.order_type == 'buy' else counter_order
            sell_order = counter_order if new_order.order_type == 'buy' else new_order

            # 1. Tally the Physical Trade
            trade = Trade(
                project_id=str(project.id),
                buyer_id=buyer,
                seller_id=seller,
                buy_order_id=buy_order.id,
                sell_order_id=sell_order.id,
                price=execution_price,
                quantity=trade_qty
            )
            db.add(trade)
            
            # 2. Unlock & Disperse Assets 
            # (Note: Sellers pre-locked bricks, Buyers pre-locked fiat at their FULL LIMIT PRICE)
            
            seller_fiat_value = Decimal(str(trade_qty)) * execution_price
            buyer_locked_fiat = Decimal(str(trade_qty)) * buy_order.price_per_brick
            refund_fiat = buyer_locked_fiat - seller_fiat_value # If Buyer was willing to pay $110 but executed at $100, refund the $10.
            
            # Credit Seller's Fiat
            seller_model = db.query(User).filter(User.id == seller).with_for_update().first()
            seller_model.wallet_balance += seller_fiat_value
            
            # Inject Bricks into Buyer's Portfolio
            holding = db.query(BrickHolding).filter(BrickHolding.user_id == buyer, BrickHolding.project_id == str(project.id)).first()
            if holding:
                holding.quantity += trade_qty
            else:
                db.add(BrickHolding(user_id=buyer, project_id=str(project.id), quantity=trade_qty))
                
            # Refund difference to Buyer's Fiat if execution was cheaper
            if refund_fiat > Decimal('0'):
                buyer_model = db.query(User).filter(User.id == buyer).with_for_update().first()
                buyer_model.wallet_balance += refund_fiat
                
            # 3. Update Order Book Logic
            new_order.unfilled_quantity -= trade_qty
            counter_order.unfilled_quantity -= trade_qty
            
            if new_order.unfilled_quantity == 0:
                new_order.status = 'fulfilled'
            else:
                new_order.status = 'partial'
                
            if counter_order.unfilled_quantity == 0:
                counter_order.status = 'fulfilled'
            else:
                counter_order.status = 'partial'
                
            # 4. Push Market Ticker
            project.market_value = execution_price
