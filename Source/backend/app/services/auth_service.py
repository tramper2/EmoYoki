"""인증 서비스"""

import random
import uuid
from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_password,
)
from app.models.user import User, UserStatus, VerificationCode
from app.schemas.user import UserRegisterRequest

settings = get_settings()


class AuthService:
    """인증 서비스"""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def register(self, data: UserRegisterRequest) -> User:
        """회원가입"""
        # 중복 확인
        existing = await self.session.execute(
            select(User).where(User.phone == data.phone)
        )
        if existing.scalar_one_or_none():
            raise ValueError("이미 가입된 휴대폰 번호입니다")

        # 테스트 모드가 아니면 인증 코드 확인
        if not settings.TEST_MODE:
            verification = await self._verify_code(data.phone, data.verification_code)
            if not verification:
                raise ValueError("인증 코드가 유효하지 않거나 만료되었습니다")

        # 사용자 생성
        user = User(
            phone=data.phone,
            password=get_password_hash(data.password),
            name=data.name,
            role=data.role,
            tier=data.tier if data.role == "HELPER" else None,
            birth_year=data.birth_year,
            terms_agreed=data.terms_agreed,
            privacy_agreed=data.privacy_agreed,
            service_agreed=data.service_agreed,
            is_phone_verified=True,
            is_verified=True,  # 테스트 모드에서 신원 확인 자동 완료
            status=UserStatus.ACTIVE,
        )

        self.session.add(user)
        await self.session.flush()
        await self.session.refresh(user)

        return user

    async def login(self, phone: str, password: str) -> tuple[User, str, str]:
        """로그인"""
        result = await self.session.execute(
            select(User).where(User.phone == phone)
        )
        user = result.scalar_one_or_none()

        if not user:
            raise ValueError("가입되지 않은 휴대폰 번호입니다")

        if user.status == UserStatus.WITHDRAWN:
            raise ValueError("탈퇴한 계정입니다")

        if user.status == UserStatus.SUSPENDED:
            raise ValueError("정지된 계정입니다")

        if not verify_password(password, user.password):
            raise ValueError("비밀번호가 일치하지 않습니다")

        # 마지막 로그인 시간 업데이트
        user.last_login_at = datetime.utcnow().isoformat()

        # 토큰 생성
        token_data = {"sub": str(user.id), "role": user.role}
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)

        return user, access_token, refresh_token

    async def send_verification_code(self, phone: str) -> str:
        """인증 코드 발송"""
        # 6자리 코드 생성
        code = f"{random.randint(100000, 999999)}"

        # 기존 코드 무효화
        await self.session.execute(
            select(VerificationCode).where(VerificationCode.phone == phone)
        )
        existing_codes = await self.session.execute(
            select(VerificationCode).where(
                VerificationCode.phone == phone,
                VerificationCode.is_used == False,
            )
        )
        for old_code in existing_codes.scalars():
            old_code.is_used = True

        # 새 코드 저장 (5분 유효)
        verification = VerificationCode(
            phone=phone,
            code=code,
            expires_at=(datetime.utcnow() + timedelta(minutes=5)).isoformat(),
        )
        self.session.add(verification)

        # TODO: 실제 SMS 발송 구현
        # await self._send_sms(phone, code)

        return code

    async def _verify_code(self, phone: str, code: str) -> bool:
        """인증 코드 확인"""
        result = await self.session.execute(
            select(VerificationCode).where(
                VerificationCode.phone == phone,
                VerificationCode.code == code,
                VerificationCode.is_used == False,
            )
        )
        verification = result.scalar_one_or_none()

        if not verification:
            return False

        # 만료 확인
        expires_at = datetime.fromisoformat(verification.expires_at)
        if datetime.utcnow() > expires_at:
            return False

        # 사용 처리
        verification.is_used = True
        return True

    async def refresh_token(self, refresh_token: str) -> tuple[str, str] | None:
        """리프레시 토큰으로 새 토큰 발급"""
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            return None

        user_id = payload.get("sub")
        if not user_id:
            return None

        result = await self.session.execute(
            select(User).where(User.id == uuid.UUID(user_id))
        )
        user = result.scalar_one_or_none()

        if not user or user.status != UserStatus.ACTIVE:
            return None

        # 새 토큰 생성
        token_data = {"sub": str(user.id), "role": user.role}
        new_access = create_access_token(token_data)
        new_refresh = create_refresh_token(token_data)

        return new_access, new_refresh

    async def get_current_user(self, token: str) -> User | None:
        """토큰으로 현재 사용자 조회"""
        payload = decode_token(token)
        if not payload or payload.get("type") != "access":
            return None

        user_id = payload.get("sub")
        if not user_id:
            return None

        result = await self.session.execute(
            select(User).where(User.id == uuid.UUID(user_id))
        )
        return result.scalar_one_or_none()
