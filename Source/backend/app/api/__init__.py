"""API 패키지"""

from app.api.auth import router as auth_router
from app.api.tasks import router as tasks_router
from app.api.test import router as test_router

__all__ = ["auth_router", "tasks_router", "test_router"]

api_routers = [
    test_router,  # 테스트 API는 먼저 등록
    auth_router,
    tasks_router,
]
