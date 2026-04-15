"""업무(호출) 모델"""

import uuid
from enum import Enum
from typing import Optional

from sqlalchemy import Boolean, DateTime, Enum as SQLEnum, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin


class TaskCategory(str, Enum):
    """업무 카테고리"""

    HOSPITAL = "HOSPITAL"  # 병원 동행
    DOG_WALK = "DOG_WALK"  # 강아지 산책
    CLEANING = "CLEANING"  # 가사/청소
    SHOPPING = "SHOPPING"  # 심부름/쇼핑
    CAREGIVING = "CAREGIVING"  # 요양 보호
    PET_CARE = "PET_CARE"  # 반려동물 돌봄
    DRIVING = "DRIVING"  # 운행 대행
    EVENT_HELPER = "EVENT_HELPER"  # 행사 보조
    ERRAND = "ERRAND"  # 심부름
    OTHER = "OTHER"  # 기타


class TaskStatus(str, Enum):
    """업무 상태"""

    WAITING = "WAITING"  # 대기 중
    MATCHED = "MATCHED"  # 매칭 완료
    ONGOING = "ONGOING"  # 진행 중 (이모님 도착 완료)
    COMPLETED = "COMPLETED"  # 완료
    CANCELLED = "CANCELLED"  # 취소


class Task(Base, UUIDMixin, TimestampMixin):
    """업무(호출) 테이블"""

    # 기본 정보
    requester_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("emo_user.id"), nullable=False
    )
    helper_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("emo_user.id"), nullable=True
    )

    # 카테고리 및 상태
    category: Mapped[TaskCategory] = mapped_column(SQLEnum(TaskCategory), nullable=False)
    status: Mapped[TaskStatus] = mapped_column(
        SQLEnum(TaskStatus), default=TaskStatus.WAITING, nullable=False
    )

    # 위치 정보
    task_location: Mapped[str] = mapped_column(String(100), nullable=False)  # POINT WKT
    address: Mapped[str] = mapped_column(String(500), nullable=False)
    detail_address: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    building_name: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)

    # 시간 정보
    scheduled_at: Mapped[str] = mapped_column(String(50), nullable=False)  # ISO datetime
    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False)  # 30분 단위

    # 금액
    amount: Mapped[int] = mapped_column(Integer, nullable=False)  # 원 단위
    is_deposit_paid: Mapped[bool] = mapped_column(Boolean, default=False)  # 입금 완료 여부

    # 요청 사항
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    requirements: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)  # 추가 요구사항

    # 매칭 관련
    matched_at: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # ISO datetime
    helper_arrived_at: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    completed_at: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # 완료 보고
    completion_photo: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    completion_note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    confirmed_by_requester: Mapped[bool] = mapped_column(Boolean, default=False)

    # 취소 관련
    cancelled_at: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    cancel_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    cancelled_by: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # requester/helper

    # 관계
    requester = relationship("User", foreign_keys=[requester_id], back_populates="tasks_as_requester")
    helper = relationship("User", foreign_keys=[helper_id], back_populates="tasks_as_helper")
    applications = relationship("HelperApplication", back_populates="task")
    reviews = relationship("Review", back_populates="task")


class HelperApplication(Base, UUIDMixin, TimestampMixin):
    """지원서 테이블"""

    task_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("emo_task.id"), nullable=False
    )
    helper_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("emo_user.id"), nullable=False
    )

    status: Mapped[str] = mapped_column(String(50), default="PENDING")  # PENDING, ACCEPTED, REJECTED
    message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # 지원 메시지

    # 관계
    task = relationship("Task", back_populates="applications")
    helper = relationship("User", back_populates="helper_applications")


class Review(Base, UUIDMixin, TimestampMixin):
    """리뷰 테이블"""

    task_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("emo_task.id"), nullable=False
    )
    reviewer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("emo_user.id"), nullable=False
    )  # 리뷰 작성자
    reviewee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("emo_user.id"), nullable=False
    )  # 리뷰 받는 사람

    rating: Mapped[int] = mapped_column(Integer, nullable=False)  # 1-5 별점
    comment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # 태그
    tags: Mapped[Optional[list]] = mapped_column(JSONB, nullable=True)  # 긍정/부정 태그

    # 관계
    task = relationship("Task", back_populates="reviews")
    reviewer = relationship("User", foreign_keys=[reviewer_id], back_populates="reviews_given")
    reviewee = relationship("User", foreign_keys=[reviewee_id], back_populates="reviews_received")


class Payment(Base, UUIDMixin, TimestampMixin):
    """결제 테이블"""

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("emo_user.id"), nullable=False
    )
    task_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("emo_task.id"), nullable=False
    )

    amount: Mapped[int] = mapped_column(Integer, nullable=False)  # 원 단위
    status: Mapped[str] = mapped_column(String(50), default="PENDING")  # PENDING, COMPLETED, FAILED

    # 결제 수단
    payment_method: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    payment_data: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    # 정산
    is_settled: Mapped[bool] = mapped_column(Boolean, default=False)
    settled_at: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
