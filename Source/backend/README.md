# 이모~여기! 백엔드 API

중장년층 맞춤형 구인 플랫폼 백엔드 서비스

## 기술 스택

- **Framework**: FastAPI 0.104+
- **Database**: PostgreSQL + PostGIS
- **ORM**: SQLAlchemy (async)
- **Cache**: Redis
- **Authentication**: JWT

## 시작하기

### 1. 의존성 설치

```bash
pip install -e .
```

### 2. 환경 변수 설정

```bash
cp .env.example .env
# .env 파일에 필요한 값 입력
```

### 3. 데이터베이스 설정

```bash
# PostgreSQL + PostGIS 설치 필요
# Docker 사용 시:
docker run --name emo-postgis -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgis/postgis:16-3.4
```

### 4. 실행

```bash
uvicorn main:app --reload --host 0.0.0.0 --8000
```

API 문서: http://localhost:8000/docs

## 프로젝트 구조

```
backend/
├── app/
│   ├── api/          # API 라우터
│   ├── core/         # 설정, 보안, DB
│   ├── models/       # DB 모델
│   ├── schemas/      # Pydantic 스키마
│   ├── services/     # 비즈니스 로직
│   └── utils/        # 유틸리티 (SMS, S3)
├── main.py           # 애플리케이션 진입점
└── pyproject.toml    # 프로젝트 설정
```

## API 명세

### 인증
- `POST /auth/register` - 회원가입
- `POST /auth/login` - 로그인
- `POST /auth/refresh` - 토큰 갱신
- `POST /auth/verify/send` - 인증 코드 발송
- `GET /auth/me` - 내 정보 조회

### 업무
- `POST /tasks` - 업무 생성
- `GET /tasks` - 업무 목록 조회
- `GET /tasks/{id}` - 업무 상세 조회
- `POST /tasks/{id}/apply` - 업무 지원
- `POST /tasks/{id}/complete` - 완료 보고
- `POST /tasks/{id}/confirm` - 완료 확인

## 개발 참고사항

- PostGIS 공간 쿼리를 사용하여 위치 기반 매칭 구현
- Redis를 활용한 캐싱 및 푸시 알림 대기열
- S3 presigned URL을 통한 클라이언트 직접 업로드
