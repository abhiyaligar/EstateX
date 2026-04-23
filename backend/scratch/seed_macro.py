import sys
import os
from datetime import datetime, timezone

# Add the parent directory to sys.path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.db import SessionLocal
from app.models.user import User
from app.models.kyc import KYCRecord
from app.models.builder import Builder
from app.models.project import Project, Milestone
from app.models.wallet import WalletTransaction
from app.models.portfolio import BrickHolding
from app.models.exchange import Order, Trade
from app.models.otp import OTPRecord
from app.models.analytics import MacroAnalytics

def seed_macro_data():
    db = SessionLocal()
    try:
        # Initial data for some pincodes
        seed_data = [
            {
                "pincode": "400001",
                "yoy_growth_percentage": 12.5,
                "avg_rental_yield": 6.8,
                "demand_score": 85
            },
            {
                "pincode": "110001",
                "yoy_growth_percentage": 10.2,
                "avg_rental_yield": 5.5,
                "demand_score": 78
            },
            {
                "pincode": "560001",
                "yoy_growth_percentage": 15.8,
                "avg_rental_yield": 7.2,
                "demand_score": 92
            },
            {
                "pincode": "600001",
                "yoy_growth_percentage": 8.4,
                "avg_rental_yield": 6.1,
                "demand_score": 70
            }
        ]

        for data in seed_data:
            # Check if exists
            existing = db.query(MacroAnalytics).filter(MacroAnalytics.pincode == data["pincode"]).first()
            if not existing:
                new_record = MacroAnalytics(
                    pincode=data["pincode"],
                    yoy_growth_percentage=data["yoy_growth_percentage"],
                    avg_rental_yield=data["avg_rental_yield"],
                    demand_score=data["demand_score"],
                    last_updated=datetime.now(timezone.utc)
                )
                db.add(new_record)
                print(f"Seeded pincode {data['pincode']}")
            else:
                print(f"Pincode {data['pincode']} already exists")
        
        db.commit()
        print("Seeding completed successfully.")
    except Exception as e:
        print(f"Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_macro_data()
