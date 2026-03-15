from pydantic import BaseModel, constr
from datetime import datetime
from typing import Optional

class KYCInitiateRequest(BaseModel):
    aadhaar: constr(min_length=12, max_length=12) # type: ignore
    pan: constr(min_length=10, max_length=10) # type: ignore

class KYCInitiateResponse(BaseModel):
    kyc_session_id: str
    status: str
    message: str
    retry_after: int = 30

class KYCVerifyOTPRequest(BaseModel):
    otp: constr(min_length=6, max_length=6) # type: ignore
    kyc_session_id: str

class KYCVerifyPANRequest(BaseModel):
    pan: constr(min_length=10, max_length=10) # type: ignore
    kyc_session_id: str

class KYCStatusResponse(BaseModel):
    status: str
    verified_date: Optional[datetime] = None
    aadhaar_verified: bool = False
    pan_verified: bool = False
    rejection_reason: Optional[str] = None
