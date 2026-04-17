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
        
        if project.status == 'halted':
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Project is currently halted for regulatory/compliance audit. Subscriptions paused.")
        
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
            
        if project.status == 'halted':
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Trading is currently halted for this project by administration.")
            
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
        Optimized High-Performance FIFO matching core.
        Uses Request-Level Batching to aggregate all trades, balance changes, and holding 
        updates into memory, executing a single bulk settlement at the end.
        """
        new_order = db.query(Order).filter(Order.id == new_order_id).first()
        if not new_order:
            return

        counter_type = 'sell' if new_order.order_type == 'buy' else 'buy'
        
        # 1. Fetch potential counterparties with Price-Time Priority
        query = db.query(Order).filter(
            Order.project_id == new_order.project_id,
            Order.order_type == counter_type,
            Order.status.in_(['open', 'partial'])
        )
        
        if new_order.order_type == 'buy':
            query = query.filter(Order.price_per_brick <= new_order.price_per_brick)
            query = query.order_by(Order.price_per_brick.asc(), Order.created_at.asc())
        else:
            query = query.filter(Order.price_per_brick >= new_order.price_per_brick)
            query = query.order_by(Order.price_per_brick.desc(), Order.created_at.asc())
            
        counter_orders = query.with_for_update().all()
        
        # 2. Accumulation Structures (In-Memory Batching)
        trades_to_create = []
        user_balance_deltas = {}  # {user_id: Decimal}
        holding_deltas = {}       # {user_id: int}
        
        project = db.query(Project).filter(Project.id == new_order.project_id).first()
        executed_at = None

        # 3. Execution Phase (Pure Calculation Loop)
        for counter_order in counter_orders:
            if new_order.unfilled_quantity <= 0:
                break
                
            trade_qty = min(new_order.unfilled_quantity, counter_order.unfilled_quantity)
            execution_price = counter_order.price_per_brick
            executed_at = execution_price
            
            buyer_id = new_order.user_id if new_order.order_type == 'buy' else counter_order.user_id
            seller_id = counter_order.user_id if new_order.order_type == 'buy' else new_order.user_id
            
            buy_order = new_order if new_order.order_type == 'buy' else counter_order
            sell_order = counter_order if new_order.order_type == 'buy' else new_order

            # Collect Trade Object
            trades_to_create.append(Trade(
                project_id=str(project.id),
                buyer_id=buyer_id,
                seller_id=seller_id,
                buy_order_id=buy_order.id,
                sell_order_id=sell_order.id,
                price=execution_price,
                quantity=trade_qty
            ))
            
            # Asset Flow Calculations
            seller_fiat_value = Decimal(str(trade_qty)) * execution_price
            buyer_locked_fiat = Decimal(str(trade_qty)) * buy_order.price_per_brick
            refund_fiat = buyer_locked_fiat - seller_fiat_value
            
            # Aggregate balance deltas
            user_balance_deltas[seller_id] = user_balance_deltas.get(seller_id, Decimal('0')) + seller_fiat_value
            if refund_fiat > 0:
                user_balance_deltas[buyer_id] = user_balance_deltas.get(buyer_id, Decimal('0')) + refund_fiat
                
            # Aggregate holding deltas (Buyer gets bricks)
            holding_deltas[buyer_id] = holding_deltas.get(buyer_id, 0) + trade_qty
            
            # Update Quantities & Statuses (Buffered in objects)
            new_order.unfilled_quantity -= trade_qty
            counter_order.unfilled_quantity -= trade_qty
            
            counter_order.status = 'fulfilled' if counter_order.unfilled_quantity == 0 else 'partial'
            new_order.status = 'fulfilled' if new_order.unfilled_quantity == 0 else 'partial'

        # 4. Settlement Phase (Bulk Database Persistence)
        if trades_to_create:
            # Save ALL trades in one batch
            db.bulk_save_objects(trades_to_create)

            # Apply aggregated Balance updates
            for u_id, delta in user_balance_deltas.items():
                db.query(User).filter(User.id == u_id).update({User.wallet_balance: User.wallet_balance + delta})

            # Apply aggregated Holding updates
            for u_id, qty_delta in holding_deltas.items():
                # Check if holding exists, if not create, else update
                existing = db.query(BrickHolding).filter(
                    BrickHolding.user_id == u_id, 
                    BrickHolding.project_id == str(project.id)
                ).with_for_update().first()
                if existing:
                    existing.quantity += qty_delta
                else:
                    db.add(BrickHolding(user_id=u_id, project_id=str(project.id), quantity=qty_delta))

            # Push final market ticker
            if executed_at:
                project.market_value = executed_at

    @staticmethod
    def cancel_order(user_id: str, order_id: str, db: Session):
        """
        Secondary Market: Withdraws an active intent and returns locked assets (Fiat/Bricks) to the user.
        """
        order = db.query(Order).filter(Order.id == order_id, Order.user_id == user_id).with_for_update().first()
        
        if not order:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")
            
        if order.status not in ['open', 'partial']:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Order cannot be cancelled. Current status: {order.status}")

        user = db.query(User).filter(User.id == user_id).with_for_update().first()
        
        # Calculate assets to return
        if order.order_type == 'buy':
            # Balance locked at order.price_per_brick
            refund_amount = Decimal(str(order.unfilled_quantity)) * order.price_per_brick
            user.wallet_balance += refund_amount
            db.add(WalletTransaction(
                user_id=user.id, 
                amount=refund_amount, 
                transaction_type='order_cancellation', 
                status='completed', 
                reference_id=f"CNL-{order.id}"
            ))
        else:
            # Bricks locked
            holding = db.query(BrickHolding).filter(BrickHolding.user_id == user_id, BrickHolding.project_id == order.project_id).with_for_update().first()
            if holding:
                holding.quantity += order.unfilled_quantity
            else:
                # This shouldn't normally happen as the bricks were locked from a holding, but for safety:
                db.add(BrickHolding(user_id=user_id, project_id=order.project_id, quantity=order.unfilled_quantity))

        order.status = 'cancelled'
        db.commit()
        return {"success": True, "message": "Order cancelled and assets released."}
