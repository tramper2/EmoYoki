"""베이스 모델 및 공통 컬럼"""

import uuid
from datetime import datetime
from typing import AsyncIterator

from sqlalchemy import DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import DeclarativeBase, Mapped, declared_attr, mapped_column


class Base(DeclarativeBase):
    """베이스 클래스"""

    @declared_attr.directive
    def __tablename__(cls) -> str:
        """테이블 이름 자동 생성 (snake_case)"""
        import re

        name = re.sub(r"(?<!^)(?=[A-Z])", "_", cls.__name__).lower()
        return f"emo_{name}"

    def __repr__(self) -> str:
        클래스이름 = self.__class__.__name__
        attrs = []
        for key in self.__mapper__.columns.keys():
            value = getattr(self, key)
            if isinstance(value, uuid.UUID):
                value = str(value)[:8] + "..."
            attrs.append(f"{key}={value}")
        return f"<{클래스이름}({', '.join(attrs)})>"


class TimestampMixin:
    """타임스탬프 믹스인"""

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )


class UUIDMixin:
    """UUID 믹스인"""

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )


class Repository:
    """베이스 리포지토리"""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, obj: Base) -> Base:
        """객체 생성"""
        self.session.add(obj)
        await self.session.flush()
        await self.session.refresh(obj)
        return obj

    async def get_by_id(self, model: type[Base], id: uuid.UUID) -> Base | None:
        """ID로 조회"""
        return await self.session.get(model, id)

    async def update(self, obj: Base) -> Base:
        """객체 수정"""
        await self.session.flush()
        await self.session.refresh(obj)
        return obj

    async def delete(self, obj: Base) -> None:
        """객체 삭제"""
        await self.session.delete(obj)

    async def list(
        self, model: type[Base], offset: int = 0, limit: int = 100
    ) -> AsyncIterator[Base]:
        """목록 조회 (비동기 이터레이터)"""
        result = await self.session.execute(
            select(model).offset(offset).limit(limit)
        )
        for row in result.scalars():
            yield row
