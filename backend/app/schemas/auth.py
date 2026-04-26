from pydantic import BaseModel, EmailStr, Field
from typing import Literal

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    role: Literal['investor', 'builder']
    user_metadata: dict = Field(default_factory=dict)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    refresh_token: str | None = None
    expires_in: int | None = None

class User(BaseModel):
    id: str
    email: str
    role: str | None = None
    kyc_status: str | None = 'pending'
    created_at: str | None = None

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str = Field(..., min_length=8)

class TokenRefreshRequest(BaseModel):
    refresh_token: str
