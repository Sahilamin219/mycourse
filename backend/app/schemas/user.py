from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    subscription_tier: Optional[str] = None
    subscription_status: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: str
    is_active: bool
    is_verified: bool
    subscription_tier: str
    subscription_status: str
    points: int
    level: int
    badges: List[str]
    streak_days: int
    debates_completed: int
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class ReferralResponse(BaseModel):
    referral_code: str
    total_referrals: int
    total_coins_earned: int


class ReferralApply(BaseModel):
    referral_code: str = Field(..., min_length=8, max_length=8)


class CoinBalanceResponse(BaseModel):
    coins: int
