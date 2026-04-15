"""업무(호출) API 라우터"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_helper, get_current_requester, get_current_user, get_optional_current_user
from app.core.database import get_async_session
from app.models.user import User
from app.schemas.task import (
    ApplicationCreate,
    ApplicationResponse,
    TaskCategory,
    TaskCompletionConfirm,
    TaskCompletionReport,
    TaskCreateRequest,
    TaskListResponse,
    TaskResponse,
    TaskStatus,
    TaskStatusUpdate,
)
from app.services.task_service import TaskService

router = APIRouter(prefix="/tasks", tags=["업무"])


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    data: TaskCreateRequest,
    current_user: User = Depends(get_current_requester),
    session: AsyncSession = Depends(get_async_session),
) -> TaskResponse:
    """업무 생성 (구인자)"""
    task_service = TaskService(session)
    task = await task_service.create_task(current_user.id, data)

    # 응답 변환
    return _task_to_response(task, current_user)


@router.get("", response_model=TaskListResponse)
async def list_tasks(
    category: TaskCategory | None = None,
    status: TaskStatus | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User | None = Depends(get_optional_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> TaskListResponse:
    """업무 목록 조회"""
    task_service = TaskService(session)

    offset = (page - 1) * page_size
    user_id = current_user.id if current_user else None

    tasks, total = await task_service.list_tasks(
        category=category,
        status=status,
        user_id=user_id,
        offset=offset,
        limit=page_size,
    )

    task_list = [_task_to_response(task, current_user) for task in tasks]

    return TaskListResponse(
        tasks=task_list,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: uuid.UUID,
    current_user: User | None = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> TaskResponse:
    """업무 상세 조회"""
    task_service = TaskService(session)
    user_id = current_user.id if current_user else None

    task = await task_service.get_task(task_id, user_id) if user_id else await task_service.get_task(task_id, uuid.UUID(int=0))

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="업무를 찾을 수 없습니다",
        )

    return _task_to_response(task, current_user)


@router.put("/{task_id}/status", response_model=TaskResponse)
async def update_task_status(
    task_id: uuid.UUID,
    data: TaskStatusUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> TaskResponse:
    """업무 상태 변경"""
    task_service = TaskService(session)
    task = await task_service.update_task_status(
        task_id, data.status, current_user.id, data.cancel_reason
    )

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="업무를 찾을 수 없습니다",
        )

    return _task_to_response(task, current_user)


@router.post("/{task_id}/apply", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def apply_to_task(
    task_id: uuid.UUID,
    data: ApplicationCreate,
    current_user: User = Depends(get_current_helper),
    session: AsyncSession = Depends(get_async_session),
) -> ApplicationResponse:
    """업무 지원 (이모님)"""
    task_service = TaskService(session)
    application = await task_service.apply_to_task(task_id, current_user.id, data.message)

    return _application_to_response(application, current_user)


@router.post("/applications/{application_id}/accept", response_model=TaskResponse)
async def accept_application(
    application_id: uuid.UUID,
    current_user: User = Depends(get_current_requester),
    session: AsyncSession = Depends(get_async_session),
) -> TaskResponse:
    """지원 수락 (구인자)"""
    task_service = TaskService(session)
    task = await task_service.accept_application(application_id, current_user.id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="지원서를 찾을 수 없습니다",
        )

    return _task_to_response(task, current_user)


@router.post("/{task_id}/complete", response_model=TaskResponse)
async def submit_completion_report(
    task_id: uuid.UUID,
    data: TaskCompletionReport,
    current_user: User = Depends(get_current_helper),
    session: AsyncSession = Depends(get_async_session),
) -> TaskResponse:
    """완료 보고서 제출 (이모님)"""
    task_service = TaskService(session)
    task = await task_service.submit_completion_report(
        task_id, current_user.id, data.completion_photo, data.completion_note
    )

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="업무를 찾을 수 없습니다",
        )

    return _task_to_response(task, current_user)


@router.post("/{task_id}/confirm", response_model=TaskResponse)
async def confirm_completion(
    task_id: uuid.UUID,
    data: TaskCompletionConfirm,
    current_user: User = Depends(get_current_requester),
    session: AsyncSession = Depends(get_async_session),
) -> TaskResponse:
    """완료 확인 (구인자)"""
    task_service = TaskService(session)
    task = await task_service.confirm_completion(task_id, current_user.id, data.confirmed)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="업무를 찾을 수 없습니다",
        )

    return _task_to_response(task, current_user)


# 헬퍼 함수
def _task_to_response(task: any, current_user: User | None) -> TaskResponse:
    """Task 모델을 TaskResponse로 변환"""
    return TaskResponse(
        id=str(task.id),
        requester_id=str(task.requester_id),
        helper_id=str(task.helper_id) if task.helper_id else None,
        category=task.category,
        status=task.status,
        title=task.title,
        description=task.description,
        lat=0.0,  # WKT에서 파싱 필요
        lng=0.0,  # WKT에서 파싱 필요
        address=task.address,
        detail_address=task.detail_address,
        building_name=task.building_name,
        scheduled_at=task.scheduled_at,
        duration_minutes=task.duration_minutes,
        amount=task.amount,
        is_deposit_paid=task.is_deposit_paid,
        matched_at=task.matched_at,
        helper_arrived_at=task.helper_arrived_at,
        completed_at=task.completed_at,
        completion_photo=task.completion_photo,
        completion_note=task.completion_note,
        confirmed_by_requester=task.confirmed_by_requester,
        created_at=task.created_at,
        updated_at=task.updated_at,
    )


def _application_to_response(application: any, current_user: User) -> ApplicationResponse:
    """HelperApplication 모델을 ApplicationResponse로 변환"""
    return ApplicationResponse(
        id=str(application.id),
        task_id=str(application.task_id),
        helper_id=str(application.helper_id),
        status=application.status,
        message=application.message,
        created_at=application.created_at,
    )
