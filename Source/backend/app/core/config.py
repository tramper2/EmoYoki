"""설정 관리模块"""

from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """애플리케이션 설정"""

    # Database
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://emo_user:emo_password@localhost:5432/emo_here"
    )
    POSTGRES_USER: str = "emo_user"
    POSTGRES_PASSWORD: str = "emo_password"
    POSTGRES_DB: str = "emo_here"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # JWT
    SECRET_KEY: str = Field(default="dev-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Kakao
    KAKAO_REST_API_KEY: str = ""
    KAKAO_APP_KEY: str = ""

    # AWS S3
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "ap-northeast-2"
    AWS_S3_BUCKET: str = "emo-here-uploads"

    # Application
    APP_NAME: str = "이모~여기!"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = True
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:5173"
    TEST_MODE: bool = True  # 테스트 모드: 인증 절차 우회

    # SMS
    SMS_API_KEY: str = ""
    SMS_SENDER: str = ""

    @property
    def cors_origins(self) -> List[str]:
        """CORS 허용 오리진 목록"""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """설정 인스턴스 반환 (캐싱)"""
    return Settings()
