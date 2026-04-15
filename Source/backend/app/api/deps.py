"""API 의존성 주입"""

import uuid
from typing import AsyncGenerator

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_async_session
from app.models.user import User, UserRole
from app.services.auth_service import AuthService

security = HTTPBearer(auto_error=False)


async def get_optional_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: AsyncSession = Depends(get_async_session),
) -> User | None:
    """선택적 인증: 토큰이 있으면 사용자 반환, 없으면 None"""
    if not credentials:
        return None
        
    auth_service = AuthService(session)
    return await auth_service.get_current_user(credentials.credentials)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: AsyncSession = Depends(get_async_session),
) -> User:
    """현재 인증된 사용자 가져오기 (필수)"""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="인증이 필요한 서비스입니다",
        )
        
    auth_service = AuthService(session)
    user = await auth_service.get_current_user(credentials.credentials)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="유효하지 않은 인증 토큰입니다",
        )

    return user


async def get_current_helper(current_user: User = Depends(get_current_user)) -> User:
    """현재 이모님(공급자) 확인"""
    if current_user.role != UserRole.HELPER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="이모님만 접근할 수 있습니다",
        )
    return current_user


async def get_current_requester(current_user: User = Depends(get_current_user)) -> User:
    """현재 구인자(사용자) 확인"""
    if current_user.role == UserRole.HELPER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="구인자만 접근할 수 있습니다",
        )
    return current_user
