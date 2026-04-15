"""업무(호출) 관련 스키마"""

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field, field_validator


class TaskCategory(str, Enum):
    """업무 카테고리"""

    HOSPITAL = "HOSPITAL"
    DOG_WALK = "DOG_WALK"
    CLEANING = "CLEANING"
    SHOPPING = "SHOPPING"
    CAREGIVING = "CAREGIVING"
    PET_CARE = "PET_CARE"
    DRIVING = "DRIVING"
    EVENT_HELPER = "EVENT_HELPER"
    ERRAND = "ERRAND"
    OTHER = "OTHER"


class TaskStatus(str, Enum):
    """업무 상태"""

    WAITING = "WAITING"
    MATCHED = "MATCHED"
    ONGOING = "ONGOING"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


# 업무 생성 요청
class TaskCreateRequest(BaseModel):
    """업무 생성 요청"""

    category: TaskCategory
    title: str = Field(..., min_length=5, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)

    # 위치 정보
    lat: float = Field(..., ge=-90, le=90, description="위도")
    lng: float = Field(..., ge=-180, le=180, description="경도")
    address: str = Field(..., min_length=5, max_length=500)
    detail_address: Optional[str] = Field(None, max_length=200)
    building_name: Optional[str] = Field(None, max_length=200)

    # 시간 정보
    scheduled_at: datetime = Field(..., description="예약 시간")
    duration_minutes: int = Field(
        ..., ge=30, le=480, multiple_of=30, description="업무 시간 (30분 단위)"
    )

    # 금액
    amount: int = Field(..., ge=5000, description="금액 (원 단위, 최소 5000원)")

    # 추가 요구사항
    requirements: Optional[dict] = None

    @field_validator("scheduled_at")
    @classmethod
    def validate_scheduled_at(cls, v: datetime) -> datetime:
        """예약 시간 검증 (최소 30분 후)"""
        if v < datetime.now():
            raise ValueError("예약 시간은 현재 시간 이후여야 합니다")
        return v


# 업무 응답
class TaskResponse(BaseModel):
    """업무 응답"""

    id: str
    requester_id: str
    helper_id: Optional[str] = None
    category: TaskCategory
    status: TaskStatus

    title: str
    description: Optional[str] = None

    # 위치
    lat: float
    lng: float
    address: str
    detail_address: Optional[str] = None
    building_name: Optional[str] = None

    # 시간
    scheduled_at: datetime
    duration_minutes: int

    # 금액
    amount: int
    is_deposit_paid: bool

    # 매칭 정보
    matched_at: Optional[datetime] = None
    helper_arrived_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    # 완료 보고
    completion_photo: Optional[str] = None
    completion_note: Optional[str] = None
    confirmed_by_requester: bool = False

    # 요청자/이모님 정보 (포함)
    requester_name: Optional[str] = None
    requester_rating: Optional[float] = None
    helper_name: Optional[str] = None
    helper_rating: Optional[float] = None
    helper_profile_image: Optional[str] = None

    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# 업무 목록 조회
class TaskListResponse(BaseModel):
    """업무 목록 응답"""

    tasks: list[TaskResponse]
    total: int
    page: int
    page_size: int


# 업무 상태 변경
class TaskStatusUpdate(BaseModel):
    """업무 상태 변경"""

    status: TaskStatus
    cancel_reason: Optional[str] = Field(None, max_length=500)


# 지원서 생성
class ApplicationCreate(BaseModel):
    """지원서 생성"""

    task_id: str
    message: Optional[str] = Field(None, max_length=500)


# 지원서 응답
class ApplicationResponse(BaseModel):
    """지원서 응답"""

    id: str
    task_id: str
    helper_id: str
    status: str
    message: Optional[str] = None
    created_at: datetime

    # 이모님 정보
    helper_name: Optional[str] = None
    helper_rating: Optional[float] = None
    helper_profile_image: Optional[str] = None
    helper_completed_tasks: Optional[int] = None

    class Config:
        from_attributes = True


# 완료 보고
class TaskCompletionReport(BaseModel):
    """업무 완료 보고"""

    completion_photo: str = Field(..., description="완료 사진 URL")
    completion_note: Optional[str] = Field(None, max_length=500, description="완료 메모")


# 구인자 확인
class TaskCompletionConfirm(BaseModel):
    """업무 완료 확인 (구인자)"""

    confirmed: bool = Field(..., description="확인 여부")
