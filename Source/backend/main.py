"""이모~여기! 메인 애플리케이션"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import api_routers
from app.core.config import get_settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """애플리케이션 수명 주기 관리"""
    # 시작 시 실행
    settings = get_settings()
    print(f"🚀 {settings.APP_NAME} v{settings.APP_VERSION} 시작!")
    print(f"🔧 Debug 모드: {settings.DEBUG}")

    yield

    # 종료 시 실행
    print("👋 애플리케이션 종료")


def create_app() -> FastAPI:
    """FastAPI 애플리케이션 생성"""
    settings = get_settings()

    app = FastAPI(
        title=settings.APP_NAME,
        description="중장년층 맞춤형 구인 플랫폼",
        version=settings.APP_VERSION,
        lifespan=lifespan,
    )

    # CORS 설정
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # 라우터 등록
    for router in api_routers:
        app.include_router(router)

    # 헬스 체크
    @app.get("/health")
    async def health_check():
        return {"status": "healthy", "service": settings.APP_NAME}

    return app


app = create_app()
