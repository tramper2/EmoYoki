"""업무(호출) 서비스"""

import uuid
from datetime import datetime
from typing import AsyncIterator

from geoalchemy2.functions import ST_DWithin, ST_Distance, ST_MakePoint
from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import cast

from app.models.task import (
    HelperApplication,
    Review,
    Task,
    TaskCategory,
    TaskStatus,
)
from app.models.user import User, UserRole
from app.schemas.task import TaskCreateRequest


class TaskService:
    """업무 서비스"""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_task(self, requester_id: uuid.UUID, data: TaskCreateRequest) -> Task:
        """업무 생성"""
        # WKT 포맷으로 위치 변환 (POINT(lng lat))
        location_wkt = f"POINT({data.lng} {data.lat})"

        task = Task(
            requester_id=requester_id,
            category=data.category.value,
            title=data.title,
            description=data.description,
            task_location=location_wkt,
            address=data.address,
            detail_address=data.detail_address,
            building_name=data.building_name,
            scheduled_at=data.scheduled_at.isoformat(),
            duration_minutes=data.duration_minutes,
            amount=data.amount,
            requirements=data.requirements,
        )

        self.session.add(task)
        await self.session.flush()
        await self.session.refresh(task)

        # TODO: 매칭 가능한 이모님들에게 푸시 알림 발송
        await self._notify_eligible_helpers(task)

        return task

    async def get_task(self, task_id: uuid.UUID, user_id: uuid.UUID) -> Task | None:
        """업무 상세 조회"""
        result = await self.session.execute(
            select(Task).where(Task.id == task_id)
        )
        task = result.scalar_one_or_none()

        # 비회원은 본인 업무만 조회 가능
        if task and task.requester_id != user_id and task.helper_id != user_id:
            # 게시판 타이틀만 반환 (내용 가림)
            return None

        return task

    async def list_tasks(
        self,
        category: TaskCategory | None = None,
        status: TaskStatus | None = None,
        user_id: uuid.UUID | None = None,
        offset: int = 0,
        limit: int = 50,
    ) -> tuple[AsyncIterator[Task], int]:
        """업무 목록 조회"""
        query = select(Task)

        # 비회원은 타이틀만 볼 수 있음 (필터링)
        conditions = []

        if category:
            conditions.append(Task.category == category.value)
        if status:
            conditions.append(Task.status == status.value)
        if user_id:
            # 내 업무 또는 공개된 업무
            conditions.append(
                or_(
                    Task.requester_id == user_id,
                    Task.helper_id == user_id,
                    Task.status == TaskStatus.WAITING,
                )
            )

        if conditions:
            query = query.where(and_(*conditions))

        # 최신순 정렬
        query = query.order_by(Task.created_at.desc())

        # 전체 카운트
        count_query = select(func.count()).select_from(query.subquery())
        total = (await self.session.execute(count_query)).scalar() or 0

        # 페이지네이션
        query = query.offset(offset).limit(limit)

        result = await self.session.execute(query)
        tasks = result.scalars()

        return tasks, total

    async def update_task_status(
        self, task_id: uuid.UUID, status: TaskStatus, user_id: uuid.UUID, cancel_reason: str | None = None
    ) -> Task | None:
        """업무 상태 변경"""
        result = await self.session.execute(
            select(Task).where(Task.id == task_id)
        )
        task = result.scalar_one_or_none()

        if not task:
            return None

        # 권한 확인
        if status == TaskStatus.CANCELLED:
            if task.requester_id != user_id and task.helper_id != user_id:
                raise ValueError("권한이 없습니다")
        elif status == TaskStatus.ONGOING:
            if task.helper_id != user_id:
                raise ValueError("권한이 없습니다")

        task.status = status.value
        task.cancel_reason = cancel_reason
        task.cancelled_at = datetime.utcnow().isoformat() if status == TaskStatus.CANCELLED else None

        await self.session.flush()
        await self.session.refresh(task)

        return task

    async def apply_to_task(self, task_id: uuid.UUID, helper_id: uuid.UUID, message: str | None) -> HelperApplication:
        """업무 지원"""
        result = await self.session.execute(
            select(Task).where(Task.id == task_id)
        )
        task = result.scalar_one_or_none()

        if not task:
            raise ValueError("존재하지 않는 업무입니다")

        if task.status != TaskStatus.WAITING:
            raise ValueError("지원할 수 없는 업무입니다")

        # 중복 지원 확인
        existing = await self.session.execute(
            select(HelperApplication).where(
                HelperApplication.task_id == task_id,
                HelperApplication.helper_id == helper_id,
            )
        )
        if existing.scalar_one_or_none():
            raise ValueError("이미 지원한 업무입니다")

        application = HelperApplication(
            task_id=task_id,
            helper_id=helper_id,
            message=message,
            status="PENDING",
        )

        self.session.add(application)
        await self.session.flush()
        await self.session.refresh(application)

        return application

    async def accept_application(
        self, application_id: uuid.UUID, requester_id: uuid.UUID
    ) -> Task | None:
        """지원 수락"""
        result = await self.session.execute(
            select(HelperApplication).where(HelperApplication.id == application_id)
        )
        application = result.scalar_one_or_none()

        if not application:
            return None

        # 권한 확인
        task_result = await self.session.execute(
            select(Task).where(Task.id == application.task_id)
        )
        task = task_result.scalar_one_or_none()

        if not task or task.requester_id != requester_id:
            raise ValueError("권한이 없습니다")

        # 매칭 처리
        application.status = "ACCEPTED"
        task.helper_id = application.helper_id
        task.status = TaskStatus.MATCHED.value
        task.matched_at = datetime.utcnow().isoformat()

        # 다른 지원서 거절
        await self.session.execute(
            select(HelperApplication).where(
                HelperApplication.task_id == task.id,
                HelperApplication.id != application_id,
            )
        )
        other_apps = await self.session.execute(
            select(HelperApplication).where(
                and_(
                    HelperApplication.task_id == task.id,
                    HelperApplication.id != application_id,
                )
            )
        )
        for app in other_apps.scalars():
            app.status = "REJECTED"

        await self.session.flush()
        await self.session.refresh(task)

        return task

    async def submit_completion_report(
        self, task_id: uuid.UUID, helper_id: uuid.UUID, photo_url: str, note: str | None
    ) -> Task | None:
        """완료 보고서 제출"""
        result = await self.session.execute(
            select(Task).where(Task.id == task_id)
        )
        task = result.scalar_one_or_none()

        if not task or task.helper_id != helper_id:
            raise ValueError("권한이 없습니다")

        task.completion_photo = photo_url
        task.completion_note = note
        task.status = TaskStatus.COMPLETED.value
        task.completed_at = datetime.utcnow().isoformat()

        await self.session.flush()
        await self.session.refresh(task)

        return task

    async def confirm_completion(
        self, task_id: uuid.UUID, requester_id: uuid.UUID, confirmed: bool
    ) -> Task | None:
        """완료 확인 (구인자)"""
        result = await self.session.execute(
            select(Task).where(Task.id == task_id)
        )
        task = result.scalar_one_or_none()

        if not task or task.requester_id != requester_id:
            raise ValueError("권한이 없습니다")

        task.confirmed_by_requester = confirmed

        await self.session.flush()
        await self.session.refresh(task)

        return task

    async def _notify_eligible_helpers(self, task: Task) -> None:
        """매칭 가능한 이모님들에게 알림 발송"""
        # PostGIS를 사용하여 반경 내 이모님 조회
        # TODO: Redis를 활용한 푸시 알림 발송
        pass

    async def find_nearby_helpers(
        self, lat: float, lng: float, radius_km: int = 10
    ) -> list[User]:
        """근처 이모님 찾기"""
        # PostGIS 공간 쿼리
        point = ST_MakePoint(lng, lat)

        result = await self.session.execute(
            select(User)
            .where(
                and_(
                    User.role == UserRole.HELPER,
                    User.status == "ACTIVE",
                    User.base_location.is_not(None),
                    ST_DWithin(User.base_location, point, radius_km * 1000),  # 미터 단위
                )
            )
            .order_by(ST_Distance(User.base_location, point))
        )

        return list(result.scalars())
