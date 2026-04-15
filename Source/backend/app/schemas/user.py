"""사용자 관련 스키마"""

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


class UserRole(str, Enum):
    USER = "USER"
    HELPER = "HELPER"
    ADMIN = "ADMIN"


class UserTier(str, Enum):
    NORMAL = "NORMAL"
    PREMIUM = "PREMIUM"


# 회원가입 요청
class UserRegisterRequest(BaseModel):
    """회원가입 요청"""

    phone: str = Field(..., pattern=r"^01[0-9]{8,9}$", description="휴대폰 번호 (01012345678)")
    password: str = Field(..., min_length=8, max_length=50, description="비밀번호")
    name: str = Field(..., min_length=2, max_length=50, description="이름")
    role: UserRole = Field(..., description="역할 (USER/HELPER)")
    verification_code: str = Field(..., min_length=6, max_length=6, description="인증 코드")

    # 이모님 전용
    tier: Optional[UserTier] = None
    birth_year: Optional[int] = Field(None, ge=1950, le=2010, description="출생년도")

    # 약관 동의
    terms_agreed: bool = Field(True, description="이용약관 동의")
    privacy_agreed: bool = Field(True, description="개인정보 처리방침 동의")
    service_agreed: bool = Field(True, description="서비스 이용동의")

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        """비밀번호 복잡성 검증"""
        if not any(c.isupper() for c in v):
            raise ValueError("비밀번호에 최소 1개의 대문자가 포함되어야 합니다")
        if not any(c.islower() for c in v):
            raise ValueError("비밀번호에 최소 1개의 소문자가 포함되어야 합니다")
        if not any(c.isdigit() for c in v):
            raise ValueError("비밀번호에 최소 1개의 숫자가 포함되어야 합니다")
        return v

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        """휴대폰 번호 포맷 변환"""
        return v.replace("-", "")


class UserLoginRequest(BaseModel):
    """로그인 요청"""

    phone: str = Field(..., description="휴대폰 번호")
    password: str = Field(..., description="비밀번호")


class TokenResponse(BaseModel):
    """토큰 응답"""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"


# 휴대폰 인증 요청
class PhoneVerificationRequest(BaseModel):
    """휴대폰 인증 요청"""

    phone: str = Field(..., pattern=r"^01[0-9]{8,9}$", description="휴대폰 번호")


class PhoneVerificationConfirm(BaseModel):
    """휴대폰 인증 확인"""

    phone: str = Field(..., description="휴대폰 번호")
    code: str = Field(..., min_length=6, max_length=6, description="인증 코드")


# 사용자 응답
class UserResponse(BaseModel):
    """사용자 정보 응답"""

    id: str
    phone: str
    name: str
    role: UserRole
    tier: Optional[UserTier] = None
    status: str
    is_verified: bool
    profile_image: Optional[str] = None
    bio: Optional[str] = None
    birth_year: Optional[int] = None
    rating: float
    review_count: int
    completed_tasks: int

    # 이모님 전용
    base_location: Optional[str] = None
    preferred_radius: Optional[int] = None

    created_at: datetime
    last_login_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# 이모님 프로필 업데이트
class HelperProfileUpdate(BaseModel):
    """이모님 프로필 업데이트"""

    name: Optional[str] = Field(None, min_length=2, max_length=50)
    bio: Optional[str] = Field(None, max_length=500)
    birth_year: Optional[int] = Field(None, ge=1950, le=2010)
    profile_image: Optional[str] = None

    # 활동 반경 설정
    base_location_lat: Optional[float] = Field(None, ge=-90, le=90)
    base_location_lng: Optional[float] = Field(None, ge=-180, le=180)
    preferred_radius: Optional[int] = Field(None, ge=1000, le=20000)  # 1km ~ 20km

    # 입금 계좌
    bank_name: Optional[str] = Field(None, max_length=50)
    account_number: Optional[str] = Field(None, min_length=10, max_length=20)
    account_holder: Optional[str] = Field(None, min_length=2, max_length=50)


class UserStatusUpdate(BaseModel):
    """사용자 상태 업데이트"""

    status: str = Field(..., description="ACTIVE/SUSPENDED/WITHDRAWN")
