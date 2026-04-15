"""리뷰 관련 스키마"""

from typing import Optional

from pydantic import BaseModel, Field


class ReviewCreate(BaseModel):
    """리뷰 생성"""

    task_id: str
    reviewee_id: str  # 리뷰 받는 사람 ID
    rating: int = Field(..., ge=1, le=5, description="별점 (1-5)")
    comment: Optional[str] = Field(None, max_length=500, description="리뷰 내용")
    tags: Optional[list[str]] = Field(None, description="태그 목록")


class ReviewResponse(BaseModel):
    """리뷰 응답"""

    id: str
    task_id: str
    reviewer_id: str
    reviewee_id: str
    rating: int
    comment: Optional[str] = None
    tags: Optional[list[str]] = None
    created_at: datetime

    # 작성자/받는 사람 정보
    reviewer_name: Optional[str] = None
    reviewee_name: Optional[str] = None

    class Config:
        from_attributes = True
