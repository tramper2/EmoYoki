"""사용자 모델"""

import uuid
from enum import Enum
from typing import Optional

from sqlalchemy import Boolean, Enum as SQLEnum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin


class UserRole(str, Enum):
    """사용자 역할"""

    USER = "USER"  # 일반 사용자 (구인자)
    HELPER = "HELPER"  # 이모님 (공급자)
    ADMIN = "ADMIN"  # 관리자


class UserTier(str, Enum):
    """이모님 회원 등급"""

    NORMAL = "NORMAL"  # 일반 회원
    PREMIUM = "PREMIUM"  # 유료 회원 (우선 알림)


class UserStatus(str, Enum):
    """사용자 상태"""

    PENDING = "PENDING"  # 가입 대기
    ACTIVE = "ACTIVE"  # 활성
    SUSPENDED = "SUSPENDED"  # 정지
    WITHDRAWN = "WITHDRAWN"  # 탈퇴


class User(Base, UUIDMixin, TimestampMixin):
    """사용자 테이블"""

    # 기본 정보
    phone: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)  # 해시된 비밀번호
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    role: Mapped[UserRole] = mapped_column(SQLEnum(UserRole), default=UserRole.USER, nullable=False)

    # 상태
    status: Mapped[UserStatus] = mapped_column(SQLEnum(UserStatus), default=UserStatus.PENDING)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)  # 본인 인증 여부
    is_phone_verified: Mapped[bool] = mapped_column(Boolean, default=False)  # 휴대폰 인증 여부

    # 프로필
    profile_image: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    birth_year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # 이모님 전용 필드
    tier: Mapped[Optional[UserTier]] = mapped_column(
        SQLEnum(UserTier), nullable=True
    )  # 회원 등급
    base_location: Mapped[Optional[str]] = mapped_column(
        String(100), nullable=True
    )  # 활동 중심지 (POINT WKT)
    preferred_radius: Mapped[Optional[int]] = mapped_column(
        Integer, nullable=True
    )  # 선호 반경 (미터)

    # 평점
    rating: Mapped[float] = mapped_column(Float, default=5.0)
    review_count: Mapped[int] = mapped_column(Integer, default=0)
    completed_tasks: Mapped[int] = mapped_column(Integer, default=0)

    # 입금 계좌 (이모님)
    bank_name: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    account_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    account_holder: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # 동의 관련
    terms_agreed: Mapped[bool] = mapped_column(Boolean, default=False)
    privacy_agreed: Mapped[bool] = mapped_column(Boolean, default=False)
    service_agreed: Mapped[bool] = mapped_column(Boolean, default=False)

    # 마지막 로그인
    last_login_at: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # 관계
    tasks_as_requester = relationship(
        "Task", foreign_keys="Task.requester_id", back_populates="requester"
    )
    tasks_as_helper = relationship(
        "Task", foreign_keys="Task.helper_id", back_populates="helper"
    )
    reviews_given = relationship(
        "Review", foreign_keys="Review.reviewer_id", back_populates="reviewer"
    )
    reviews_received = relationship(
        "Review", foreign_keys="Review.reviewee_id", back_populates="reviewee"
    )
    helper_applications = relationship("HelperApplication", back_populates="helper")


class VerificationCode(Base, UUIDMixin, TimestampMixin):
    """인증 코드 테이블"""

    phone: Mapped[str] = mapped_column(String(20), index=True, nullable=False)
    code: Mapped[str] = mapped_column(String(10), nullable=False)
    is_used: Mapped[bool] = mapped_column(Boolean, default=False)
    expires_at: Mapped[str] = mapped_column(String(50), nullable=False)  # ISO datetime
