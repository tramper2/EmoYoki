"""테스트용 API 라우터 (개발 모드 전용)"""

import uuid
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import get_async_session
from app.core.security import create_access_token, create_refresh_token, get_password_hash
from app.models.task import HelperApplication, Review, Task, TaskCategory, TaskStatus
from app.models.user import User, UserRole, UserStatus

router = APIRouter(prefix="/test", tags=["테스트"])

settings = get_settings()


@router.post("/create-user")
async def create_test_user(
    role: UserRole,
    session: AsyncSession = Depends(get_async_session),
):
    """테스트용 사용자 생성 (인증 절차 우회)"""

    if not settings.TEST_MODE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="테스트 모드에서만 사용 가능합니다",
        )

    # 랜덤 사용자 생성
    random_num = uuid.uuid4().int % 10000

    if role == UserRole.USER:
        phone = f"010{random_num:04d}0001"
        name = f"테스트구인자{random_num}"
        tier = None
    else:
        phone = f"010{random_num:04d}0002"
        name = f"테스트이모님{random_num}"
        tier = "NORMAL"

    user = User(
        phone=phone,
        password=get_password_hash("test1234"),  # 테스트용 공통 비밀번호
        name=name,
        role=role,
        tier=tier,
        birth_year=1960 + (random_num % 30),
        bio="테스트용 사용자입니다",
        rating=4.5 + (random_num % 10) / 20,  # 4.5 ~ 5.0
        review_count=random_num % 50,
        completed_tasks=random_num % 30,
        is_phone_verified=True,
        is_verified=True,
        status=UserStatus.ACTIVE,
        terms_agreed=True,
        privacy_agreed=True,
        service_agreed=True,
        last_login_at=datetime.utcnow().isoformat(),
    )

    # 이모님일 경우 추가 정보
    if role == UserRole.HELPER:
        # 서울 강남구 근처 랜덤 위치
        base_lat = 37.5 + (random_num % 100) / 10000
        base_lng = 127.0 + (random_num % 100) / 10000
        user.base_location = f"POINT({base_lng} {base_lat})"
        user.preferred_radius = 5000  # 5km
        user.bank_name = "국민은행"
        user.account_number = f"{random_num:012d}"
        user.account_holder = name

    session.add(user)
    await session.flush()
    await session.refresh(user)

    # 토큰 생성
    token_data = {"sub": str(user.id), "role": user.role}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return {
        "user": {
            "id": str(user.id),
            "phone": user.phone,
            "name": user.name,
            "role": user.role,
            "password": "test1234",  # 편의를 위해 비밀번호 표시
        },
        "access_token": access_token,
        "refresh_token": refresh_token,
        "message": f"테스트용 {role.value} 계정이 생성되었습니다",
    }


@router.post("/seed-data")
async def seed_test_data(
    session: AsyncSession = Depends(get_async_session),
):
    """테스트용 데이터 시딩"""

    if not settings.TEST_MODE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="테스트 모드에서만 사용 가능합니다",
        )

    # 기존 테스트 데이터 확인 및 생성
    existing_user = await session.execute(
        select(User).where(User.phone == "01000000001")
    )
    if existing_user.scalar_one_or_none():
        return {
            "message": "테스트 데이터가 이미 존재합니다",
            "users": {
                "requester": {
                    "phone": "01000000001",
                    "password": "test1234",
                    "name": "김구인",
                },
                "helpers": [
                    {"phone": "01000000201", "password": "test1234", "name": "이이모"},
                    {"phone": "01000000301", "password": "test1234", "name": "박이모"},
                    {"phone": "01000000401", "password": "test1234", "name": "최이모"},
                    {"phone": "01000000501", "password": "test1234", "name": "정이모"},
                    {"phone": "01000000601", "password": "test1234", "name": "강이모"},
                ],
            },
        }

    # 테스트용 구인자 생성
    requester = User(
        phone="01000000001",
        password=get_password_hash("test1234"),
        name="김구인",
        role=UserRole.USER,
        rating=4.8,
        review_count=15,
        completed_tasks=12,
        is_phone_verified=True,
        is_verified=True,
        status=UserStatus.ACTIVE,
        terms_agreed=True,
        privacy_agreed=True,
        service_agreed=True,
        last_login_at=datetime.utcnow().isoformat(),
    )
    session.add(requester)
    await session.flush()

    # 테스트용 이모님 5명 생성
    helpers = []
    helper_names = ["이이모", "박이모", "최이모", "정이모", "강이모"]
    for i, name in enumerate(helper_names):
        helper = User(
            phone=f"0100000{i + 2:02d}01",
            password=get_password_hash("test1234"),
            name=name,
            role=UserRole.HELPER,
            tier="PREMIUM" if i < 2 else "NORMAL",  # 前2명 프리미엄
            birth_year=1965 + i * 3,
            bio="신속 정확하게 도와드려요!",
            rating=4.5 + i * 0.1,
            review_count=10 + i * 5,
            completed_tasks=8 + i * 3,
            base_location=f"POINT({127.02 + i * 0.01} {37.51 + i * 0.01})",
            preferred_radius=5000,
            bank_name="국민은행",
            account_number=f"1234567890{i + 1:02d}",
            account_holder=name,
            is_phone_verified=True,
            is_verified=True,
            status=UserStatus.ACTIVE,
            terms_agreed=True,
            privacy_agreed=True,
            service_agreed=True,
            last_login_at=datetime.utcnow().isoformat(),
        )
        session.add(helper)
        await session.flush()
        helpers.append(helper)

    # 테스트용 업무 10개 생성
    categories = [
        TaskCategory.HOSPITAL,
        TaskCategory.DOG_WALK,
        TaskCategory.CLEANING,
        TaskCategory.SHOPPING,
        TaskCategory.CAREGIVING,
    ]

    task_titles = [
        "어머니 병원 동행 도와주세요",
        "강아지 산책 30분 부탁드려요",
        "이사 청소 도와주세요",
        "마트 심부름 부탁드립니다",
        "요양원 모시고 다녀오실 분",
    ]

    for i in range(10):
        scheduled_at = datetime.utcnow() + timedelta(days=i % 3, hours=10 + (i % 8))
        task = Task(
            requester_id=requester.id,
            category=categories[i % len(categories)],
            status=TaskStatus.WAITING,
            title=task_titles[i % len(task_titles)],
            description=f"{i + 1}번째 테스트 업무입니다. 신속하게 도와주세요.",
            task_location=f"POINT({127.02 + i * 0.005} {37.51 + i * 0.005})",
            address=f"서울시 강남구 역삼동 {i + 1}번지",
            building_name=f"테스트빌딩 {i + 1}",
            scheduled_at=scheduled_at.isoformat(),
            duration_minutes=[30, 60, 90, 120][i % 4],
            amount=10000 + i * 5000,
            is_deposit_paid=True,
        )
        session.add(task)

    await session.commit()

    return {
        "message": "테스트 데이터가 생성되었습니다",
        "users": {
            "requester": {
                "phone": "01000000001",
                "password": "test1234",
                "name": "김구인",
            },
            "helpers": [
                {"phone": f"0100000{i + 2:02d}01", "password": "test1234", "name": name}
                for i, name in enumerate(helper_names)
            ],
        },
        "tasks_created": 10,
    }


@router.get("/accounts")
async def get_test_accounts():
    """테스트용 계정 목록 조회"""

    if not settings.TEST_MODE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="테스트 모드에서만 사용 가능합니다",
        )

    return {
        "message": "테스트용 계정 목록입니다",
        "accounts": [
            {
                "type": "구인자",
                "phone": "01000000001",
                "password": "test1234",
                "name": "김구인",
            },
            {
                "type": "이모님 (프리미엄)",
                "phone": "01000000201",
                "password": "test1234",
                "name": "이이모",
            },
            {
                "type": "이모님 (프리미엄)",
                "phone": "01000000301",
                "password": "test1234",
                "name": "박이모",
            },
            {
                "type": "이모님 (일반)",
                "phone": "01000000401",
                "password": "test1234",
                "name": "최이모",
            },
            {
                "type": "이모님 (일반)",
                "phone": "01000000501",
                "password": "test1234",
                "name": "정이모",
            },
            {
                "type": "이모님 (일반)",
                "phone": "01000000601",
                "password": "test1234",
                "name": "강이모",
            },
        ],
        "note": "이 계정들은 /test/seed-data 실행 시 생성됩니다",
    }


@router.post("/reset")
async def reset_test_data(
    session: AsyncSession = Depends(get_async_session),
):
    """테스트 데이터 초기화"""

    if not settings.TEST_MODE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="테스트 모드에서만 사용 가능합니다",
        )

    # 모든 테스트 사용자 삭제 (0100000으로 시작하는 번호)
    result = await session.execute(
        select(User).where(User.phone.like("0100000%"))
    )
    for user in result.scalars():
        await session.delete(user)

    # 모든 테스트 업무 삭제
    result = await session.execute(select(Task))
    for task in result.scalars():
        await session.delete(task)

    await session.commit()


    return {"message": "테스트 데이터가 초기화되었습니다"}


@router.get("/login")
async def test_login(
    phone: str,
    session: AsyncSession = Depends(get_async_session),
):
    """테스트용 빠른 로그인 (비밀번호 없이 전화번호로만)"""
    if not settings.TEST_MODE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="테스트 모드에서만 사용 가능합니다",
        )

    result = await session.execute(
        select(User).where(User.phone == phone)
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="사용자를 찾을 수 없습니다",
        )

    token_data = {"sub": str(user.id), "role": user.role}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return {
        "user": {
            "id": str(user.id),
            "phone": user.phone,
            "name": user.name,
            "role": user.role,
        },
        "access_token": access_token,
        "refresh_token": refresh_token,
    }
