from sqlalchemy.orm import Session
from sqlalchemy import func
from decimal import Decimal
from datetime import date, datetime
import pytz
import logging

from app.core.db import SessionLocal
from app.models.exchange import DailyCandle, Trade
from app.models.project import Project

logger = logging.getLogger(__name__)

IST = pytz.timezone("Asia/Kolkata")


def _get_today_ist() -> date:
    return datetime.now(IST).date()


class CandleService:

    @staticmethod
    def get_or_create_today_candle(db: Session, project_id: str, fallback_price: Decimal) -> DailyCandle:
        """
        Returns today's open candle for a project.
        If it doesn't exist yet (e.g. first trade before the scheduler ran),
        creates it on-the-fly using the fallback_price as the open.
        """
        today = _get_today_ist()
        candle = db.query(DailyCandle).filter(
            DailyCandle.project_id == project_id,
            DailyCandle.date == today,
            DailyCandle.is_finalized == False
        ).first()

        if not candle:
            candle = DailyCandle(
                project_id=project_id,
                date=today,
                open_price=fallback_price,
                high_price=fallback_price,
                low_price=fallback_price,
                close_price=fallback_price,
                volume=0,
                is_finalized=False
            )
            db.add(candle)
            db.flush()  # Get the ID without committing yet

        return candle

    @staticmethod
    def update_live_candle(db: Session, project_id: str, trade_price: Decimal, trade_qty: int, fallback_price: Decimal):
        """
        Called from the matching engine after every trade execution.
        Updates high/low/close/volume atomically on the current day's candle.
        """
        today = _get_today_ist()

        # Atomic update — pushes all arithmetic to DB engine
        rows = db.query(DailyCandle).filter(
            DailyCandle.project_id == project_id,
            DailyCandle.date == today,
            DailyCandle.is_finalized == False
        ).update(
            {
                DailyCandle.high_price:  func.greatest(DailyCandle.high_price, trade_price),
                DailyCandle.low_price:   func.least(DailyCandle.low_price, trade_price),
                DailyCandle.close_price: trade_price,
                DailyCandle.volume:      DailyCandle.volume + trade_qty,
            },
            synchronize_session=False
        )

        # No candle yet today (scheduler hasn't run or first ever trade) — create it
        if rows == 0:
            CandleService.get_or_create_today_candle(db, project_id, fallback_price)
            # Retry the update now that the candle exists
            db.query(DailyCandle).filter(
                DailyCandle.project_id == project_id,
                DailyCandle.date == today,
                DailyCandle.is_finalized == False
            ).update(
                {
                    DailyCandle.high_price:  func.greatest(DailyCandle.high_price, trade_price),
                    DailyCandle.low_price:   func.least(DailyCandle.low_price, trade_price),
                    DailyCandle.close_price: trade_price,
                    DailyCandle.volume:      DailyCandle.volume + trade_qty,
                },
                synchronize_session=False
            )

    @staticmethod
    def get_circuit_breaker_base(db: Session, project_id: str, ipo_price: Decimal) -> Decimal:
        """
        Returns the open_price of today's candle as the circuit breaker base.
        Falls back to ipo_price if no candle exists yet.
        """
        today = _get_today_ist()
        candle = db.query(DailyCandle).filter(
            DailyCandle.project_id == project_id,
            DailyCandle.date == today
        ).first()
        return candle.open_price if candle else ipo_price


# ─────────────────────────────────────────────────────────────────────────────
# APScheduler Jobs — called from app/main.py
# ─────────────────────────────────────────────────────────────────────────────

def close_daily_candles():
    """
    Runs at 11:59 PM IST.
    Finalizes every active project's candle for today.
    Sets project.previous_close_price = today's close for legacy compatibility.
    """
    db: Session = SessionLocal()
    try:
        today = _get_today_ist()
        candles = db.query(DailyCandle).filter(
            DailyCandle.date == today,
            DailyCandle.is_finalized == False
        ).all()

        for candle in candles:
            candle.is_finalized = True
            # Keep project.previous_close_price in sync for any legacy reads
            db.query(Project).filter(Project.id == candle.project_id).update(
                {Project.previous_close_price: candle.close_price},
                synchronize_session=False
            )

        db.commit()
        logger.info(f"[Candle Scheduler] Closed {len(candles)} candles for {today}.")
    except Exception as e:
        db.rollback()
        logger.error(f"[Candle Scheduler] close_daily_candles FAILED: {e}")
    finally:
        db.close()


def open_daily_candles():
    """
    Runs at 12:00 AM IST.
    Creates a fresh candle for every actively trading project.
    open_price = yesterday's close_price (or ipo_price if no history).
    """
    db: Session = SessionLocal()
    try:
        today = _get_today_ist()

        projects = db.query(Project).filter(
            Project.ipo_status == 'completed',
            Project.status == 'approved'
        ).all()

        created = 0
        for project in projects:
            # Skip if candle already exists (idempotent)
            existing = db.query(DailyCandle).filter(
                DailyCandle.project_id == project.id,
                DailyCandle.date == today
            ).first()
            if existing:
                continue

            # Open price = previous close or ipo_price
            open_price = project.previous_close_price or project.ipo_price

            db.add(DailyCandle(
                project_id=str(project.id),
                date=today,
                open_price=open_price,
                high_price=open_price,
                low_price=open_price,
                close_price=open_price,
                volume=0,
                is_finalized=False
            ))
            created += 1

        db.commit()
        logger.info(f"[Candle Scheduler] Opened {created} new candles for {today}.")
    except Exception as e:
        db.rollback()
        logger.error(f"[Candle Scheduler] open_daily_candles FAILED: {e}")
    finally:
        db.close()
