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
from app.services.candle_service import CandleService

from sqlalchemy import func
from app.core.db import SessionLocal

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
        
        # Add to Builder's funding raised and Admin Escrow
        project.funding_raised += total_cost
        project.total_escrow_held += total_cost
        
        # Allocate bricks natively to the investor's Portfolio
        holding = db.query(BrickHolding).filter(BrickHolding.user_id == user_id, BrickHolding.project_id == project_id).first()
        if holding:
            holding.quantity += quantity
            holding.total_cost_basis += total_cost_basis
        else:
            holding = BrickHolding(user_id=user_id, project_id=project_id, quantity=quantity, total_cost_basis=total_cost_basis)
            db.add(holding)
            
        db.commit()
        return {"success": True, "message": f"Successfully purchased {quantity} Bricks for {total_cost} INR."}

    @staticmethod
    def _enforce_circuit_breakers(project: Project, desired_price: Decimal, db: Session):
        """
        Secondary Market: Clamps volatility to +20% / -10% from today's session open.
        open_price is frozen at 12:00 AM IST and never changes during the trading day,
        making it pump-proof regardless of intraday price movement.
        """
        base_price = CandleService.get_circuit_breaker_base(
            db, str(project.id), project.ipo_price
        )

        max_allowed = base_price * Decimal('1.20')
        min_allowed = base_price * Decimal('0.90')

        if desired_price > max_allowed:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Upper Circuit Limit Hit. Max price allowed is {max_allowed:.2f}")
        if desired_price < min_allowed:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Lower Circuit Limit Hit. Min price allowed is {min_allowed:.2f}")

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
            
        order_type = order_data.order_type.lower()
        if order_type not in ['buy', 'sell']:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Order must be 'buy' or 'sell'.")

        execution_type = (order_data.execution_type or 'limit').lower()
        if execution_type not in ['limit', 'market']:
             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Execution type must be 'limit' or 'market'.")

        price_val = Decimal(str(order_data.price_per_brick)) if order_data.price_per_brick else None
        
        # Determine circuit limits for market buy locking
        base_price = CandleService.get_circuit_breaker_base(db, str(project.id), project.ipo_price)
        upper_limit = base_price * Decimal('1.20')
        
        if execution_type == 'limit':
            if price_val is None:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Limit orders require a price.")
            ExchangeService._enforce_circuit_breakers(project, price_val, db)
            
        user = db.query(User).filter(User.id == user_id).with_for_update().first()
        
        # 1. Escrow Assets (Mathematically strict pre-deduction)
        if order_type == 'buy':
            # For Market Buy, we lock at the UPPER circuit limit to ensure user has enough for any matched price
            lock_price = price_val if execution_type == 'limit' else upper_limit
            total_escrow_needed = Decimal(str(order_data.quantity)) * lock_price
            
            if user.wallet_balance < total_escrow_needed:
                msg = "Insufficient Wallet Balance to lock Buy Order."
                if execution_type == 'market':
                    msg += f" Market buys lock funds at the upper circuit limit (₹{upper_limit:,.2f}) to ensure settlement."
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)
            
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
            execution_type=execution_type,
            price_per_brick=price_val, # None for market
            quantity=order_data.quantity,
            unfilled_quantity=order_data.quantity,
            status='open'
        )
        db.add(new_order)
        db.flush() # Secure UUID without committing entirely yet
        
        # NOTE: Matching Engine is now fired as a BackgroundTask in the API layer 
        # for instant user feedback.
        
        db.commit() # Globally commits the spawned order
        db.refresh(new_order)
        return new_order

    @staticmethod
    def run_matching_engine(order_id: UUID):
        """
        Background Worker for the matching engine.
        Spawns a new database session to ensure isolation from the request cycle.
        """
        db = SessionLocal()
        try:
            ExchangeService._matching_engine(order_id, db)
            db.commit()
        except Exception as e:
            db.rollback()
            print(f"MATCHING ENGINE BACKGROUND ERROR: {str(e)}")
        finally:
            db.close()

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
        
        if new_order.execution_type == 'limit':
            if new_order.order_type == 'buy':
                query = query.filter(Order.price_per_brick <= new_order.price_per_brick)
                query = query.order_by(Order.price_per_brick.asc(), Order.created_at.asc())
            else:
                query = query.filter(Order.price_per_brick >= new_order.price_per_brick)
                query = query.order_by(Order.price_per_brick.desc(), Order.created_at.asc())
        else:
            # Market Orders ignore price constraints on the counter-party
            # We sort NULLS FIRST for market-to-market matching priority if counter-parties are also market
            if new_order.order_type == 'buy':
                query = query.order_by(Order.price_per_brick.asc().nullsfirst(), Order.created_at.asc())
            else:
                query = query.order_by(Order.price_per_brick.desc().nullsfirst(), Order.created_at.asc())
            
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
            
            # Price Discovery:
            # 1. If counter_order is LIMIT, use its price.
            # 2. If counter_order is MARKET, use new_order price (if new_order is LIMIT).
            # 3. If BOTH are MARKET, use latest project price or IPO price.
            if counter_order.price_per_brick is not None:
                execution_price = counter_order.price_per_brick
            elif new_order.price_per_brick is not None:
                execution_price = new_order.price_per_brick
            else:
                execution_price = project.market_value or project.ipo_price
            
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
            
            # For Buyer Refund:
            # If Limit Buy: refund = trade_qty * (buy_order.price - execution_price)
            # If Market Buy: refund = trade_qty * (upper_limit - execution_price)
            # Note: For Buy Orders, we already locked the funds at either buy_order.price or upper_limit.
            
            if buy_order.execution_type == 'limit':
                locked_price_per_brick = buy_order.price_per_brick
            else:
                # Need upper limit for market buy refund
                base_p = CandleService.get_circuit_breaker_base(db, str(project.id), project.ipo_price)
                locked_price_per_brick = base_p * Decimal('1.20')

            buyer_locked_fiat = Decimal(str(trade_qty)) * locked_price_per_brick
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
                    # Update cost basis for buyer (add spent amount)
                    existing.quantity += qty_delta
                    existing.total_cost_basis += (Decimal(str(qty_delta)) * execution_price)
                else:
                    db.add(BrickHolding(
                        user_id=u_id, 
                        project_id=str(project.id), 
                        quantity=qty_delta,
                        total_cost_basis=(Decimal(str(qty_delta)) * execution_price)
                    ))

            # Apply aggregated Basis updates for Sellers (Pro-rata reduction)
            # We need to fetch sellers specifically to reduce their basis based on how much they sold
            # (In a real high-perf engine this would be part of the accumulation logic, 
            # but for simplicity we do it here)
            unique_sellers = set(t.seller_id for t in trades_to_create)
            for s_id in unique_sellers:
                total_sold = sum(t.quantity for t in trades_to_create if t.seller_id == s_id)
                seller_holding = db.query(BrickHolding).filter(
                    BrickHolding.user_id == s_id,
                    BrickHolding.project_id == str(project.id)
                ).with_for_update().first()
                if seller_holding and seller_holding.quantity + total_sold > 0:
                    # Basis reduction: new_basis = old_basis * (remaining / (remaining + sold))
                    # Note: bricks were already deducted from 'quantity' when the order was PLACED.
                    # So seller_holding.quantity is already the 'remaining' amount.
                    old_total_qty = seller_holding.quantity + total_sold
                    reduction_factor = Decimal(str(seller_holding.quantity)) / Decimal(str(old_total_qty))
                    seller_holding.total_cost_basis = seller_holding.total_cost_basis * reduction_factor

            # Push final market ticker + update live candle
            if executed_at:
                project.market_value = executed_at
                # Initialize previous_close_price on first-ever trade (legacy compat)
                if project.previous_close_price is None:
                    project.previous_close_price = executed_at
                # Update today's OHLCV candle (high/low/close/volume) atomically
                total_qty_traded = sum(t.quantity for t in trades_to_create)
                CandleService.update_live_candle(
                    db,
                    str(project.id),
                    executed_at,
                    total_qty_traded,
                    project.ipo_price
                )

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
            # Balance locked at order.price_per_brick (Limit) or upper_limit (Market)
            if order.execution_type == 'limit':
                refund_amount = Decimal(str(order.unfilled_quantity)) * order.price_per_brick
            else:
                project = db.query(Project).filter(Project.id == order.project_id).first()
                base_p = CandleService.get_circuit_breaker_base(db, str(project.id), project.ipo_price)
                upper_limit = base_p * Decimal('1.20')
                refund_amount = Decimal(str(order.unfilled_quantity)) * upper_limit
            
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
