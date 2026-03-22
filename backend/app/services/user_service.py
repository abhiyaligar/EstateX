from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.schemas.user import UserProfileUpdate

class UserService:
    @staticmethod
    def update_profile(user_id: str, update_data: UserProfileUpdate, db: Session):
        db_user = db.query(User).filter(User.id == user_id).first()
        if not db_user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
            
        update_dict = update_data.model_dump(exclude_unset=True)
        
        for key, value in update_dict.items():
            setattr(db_user, key, value)
            
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def add_bank_account(user_id: str, bank_data, db: Session):
        from app.models.user import BankAccount
        
        # If user sets this as primary, unset other primaries
        if bank_data.is_primary:
            db.query(BankAccount).filter(BankAccount.user_id == user_id).update({"is_primary": False})
            
        new_bank = BankAccount(
            user_id=user_id,
            account_number=bank_data.account_number,
            ifsc_code=bank_data.ifsc_code,
            account_holder_name=bank_data.account_holder_name,
            is_primary=bank_data.is_primary
        )
        db.add(new_bank)
        db.commit()
        db.refresh(new_bank)
        return new_bank

    @staticmethod
    def get_bank_accounts(user_id: str, db: Session):
        from app.models.user import BankAccount
        return db.query(BankAccount).filter(BankAccount.user_id == user_id).all()

    @staticmethod
    def remove_bank_account(user_id: str, bank_id: str, db: Session):
        from app.models.user import BankAccount
        bank = db.query(BankAccount).filter(BankAccount.id == bank_id, BankAccount.user_id == user_id).first()
        if not bank:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bank account not found")
            
        db.delete(bank)
        db.commit()
