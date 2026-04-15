"""인증 API 라우터"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_async_session
from app.models.user import User
from app.schemas.user import (
    HelperProfileUpdate,
    PhoneVerificationConfirm,
    PhoneVerificationRequest,
    TokenResponse,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["인증"])


@router.post("/register", response_model=UserResponse)
async def register(
    data: UserRegisterRequest,
    session: AsyncSession = Depends(get_async_session),
) -> User:
    """회원가입"""
    try:
        auth_service = AuthService(session)
        user = await auth_service.register(data)
        return user  # type: ignore
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/login", response_model=TokenResponse)
async def login(
    data: UserLoginRequest,
    session: AsyncSession = Depends(get_async_session),
) -> TokenResponse:
    """로그인"""
    try:
        auth_service = AuthService(session)
        _, access_token, refresh_token = await auth_service.login(data.phone, data.password)
        return TokenResponse(access_token=access_token, refresh_token=refresh_token)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    refresh_token: str,
    session: AsyncSession = Depends(get_async_session),
) -> TokenResponse:
    """토큰 갱신"""
    auth_service = AuthService(session)
    result = await auth_service.refresh_token(refresh_token)

    if not result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="유효하지 않은 리프레시 토큰입니다",
        )

    access_token, new_refresh = result
    return TokenResponse(access_token=access_token, refresh_token=new_refresh)


@router.post("/verify/send")
async def send_verification_code(
    data: PhoneVerificationRequest,
    session: AsyncSession = Depends(get_async_session),
) -> dict:
    """인증 코드 발송"""
    auth_service = AuthService(session)
    code = await auth_service.send_verification_code(data.phone)

    # 개발 환경에서는 인증 코드 반환 (운영 환경에서는 제거 필요)
    return {"message": "인증 코드가 발송되었습니다", "code": code}


@router.post("/verify/confirm")
async def confirm_verification(
    data: PhoneVerificationConfirm,
    session: AsyncSession = Depends(get_async_session),
) -> dict:
    """인증 코드 확인"""
    auth_service = AuthService(session)
    verified = await auth_service._verify_code(data.phone, data.code)

    if not verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="인증 코드가 유효하지 않거나 만료되었습니다",
        )

    return {"message": "인증이 완료되었습니다"}


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(get_current_user),
) -> User:
    """내 정보 조회"""
    return current_user  # type: ignore


@router.put("/me/profile", response_model=UserResponse)
async def update_profile(
    data: HelperProfileUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> User:
    """프로필 수정 (이모님)"""
    # 데이터 업데이트
    if data.name is not None:
        current_user.name = data.name
    if data.bio is not None:
        current_user.bio = data.bio
    if data.birth_year is not None:
        current_user.birth_year = data.birth_year
    if data.profile_image is not None:
        current_user.profile_image = data.profile_image

    # 활동 반경 설정
    if data.base_location_lat is not None and data.base_location_lng is not None:
        from sqlalchemy import text

        # WKT 포맷: POINT(lng lat)
        current_user.base_location = f"POINT({data.base_location_lng} {data.base_location_lat})"
    if data.preferred_radius is not None:
        current_user.preferred_radius = data.preferred_radius

    # 입금 계좌
    if data.bank_name is not None:
        current_user.bank_name = data.bank_name
    if data.account_number is not None:
        current_user.account_number = data.account_number
    if data.account_holder is not None:
        current_user.account_holder = data.account_holder

    await session.flush()
    await session.refresh(current_user)

    return current_user  # type: ignore
