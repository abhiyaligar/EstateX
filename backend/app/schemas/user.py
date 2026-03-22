from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import date, datetime
from uuid import UUID

class UserProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    profile_image_url: Optional[str] = None
    account_type: Optional[str] = None
    
    # Banking
    bank_account_number: Optional[str] = None
    bank_ifsc_code: Optional[str] = None
    bank_account_holder_name: Optional[str] = None
    
    # Preferences
    notification_email: Optional[bool] = None
    notification_sms: Optional[bool] = None
    notification_push: Optional[bool] = None
    language: Optional[str] = None
    timezone: Optional[str] = None

class UserProfileResponse(BaseModel):
    id: UUID
    email: str
    phone: Optional[str]
    first_name: Optional[str]
    last_name: Optional[str]
    profile_image_url: Optional[str]
    kyc_status: str
    wallet_balance: float
    wallet_address: Optional[str]
    account_type: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True
