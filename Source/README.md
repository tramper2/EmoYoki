# 이모~여기!

우리 동네 믿음직한 손길이 필요할 때, 이모~여기!

## 프로젝트 개요

중장년층을 위한 위치 기반 구인 플랫폼으로, 신뢰할 수 있는 이모님들과 도움이 필요한 가정을 연결합니다.

## 기술 스택

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL + PostGIS
- **Cache**: Redis
- **ORM**: SQLAlchemy (async)

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **State**: Zustand
- **Map**: Kakao Maps SDK

## 주요 기능

### 구인자 (USER)
- 📝 업무(호출) 생성: 카테고리, 위치, 시간, 금액 설정
- 📋 업무 관리: 대기, 매칭, 진행, 완료 상태 확인
- ⭐ 이모님 평가: 완료 후 별점 및 리뷰 작성
- 💳 입금 관리: 업무 시작 전 입금 확인

### 이모님 (HELPER)
- 🔍 업무 찾기: 카테고리별 필터링, 검색
- 📍 활동 반경 설정: 2km/5km/10km 선택
- 📱 푸시 알림: 프리미엄 회원 우선 수신
- 💰 입금 계좌: 정산을 위한 계좌 등록
- 🏆 활동 내역: 완료 업무, 평점 관리

## 🚀 시작하기

### 로컬 테스트 (빠른 로그인)

```bash
cd Source
docker-compose up -d
```

http://localhost:3000 접속 후 메인 페이지에서 **빠른 로그인** 버튼 클릭!

| 버튼 | 계정 | 비밀번호 |
|------|------|----------|
| 구인자 | 01000000001 | test1234 |
| 프리미엄 이모님 | 01000000201 | test1234 |
| 일반 이모님 | 01000000401 | test1234 |

### EC2 배포

```bash
# EC2 서버에서 배포 스크립트 실행
chmod +x deploy.sh
./deploy.sh
```

상세 가이드: [EC2_배포_가이드.md](../Doc/EC2_배포_가이드.md)

### 개발 환경 설정

#### Backend

```bash
cd backend
pip install -e .
cp .env.example .env
uvicorn main:app --reload
```

#### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## 프로젝트 구조

```
Source/
├── backend/           # FastAPI 백엔드
│   ├── app/
│   │   ├── api/      # API 라우터
│   │   ├── core/     # 설정, 보안, DB
│   │   ├── models/   # DB 모델
│   │   ├── schemas/  # Pydantic 스키마
│   │   ├── services/ # 비즈니스 로직
│   │   └── utils/    # 유틸리티
│   └── main.py
├── frontend/          # React 프론트엔드
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   └── types/
│   └── index.html
└── docker-compose.yml
```

## 환경 변수

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `POSTGRES_USER` | DB 사용자 | `emo_user` |
| `POSTGRES_PASSWORD` | DB 비밀번호 | `emo_password` |
| `POSTGRES_DB` | DB 이름 | `emo_here` |
| `SECRET_KEY` | JWT 시크릿 키 | - |
| `KAKAO_REST_API_KEY` | 카카오 REST API 키 | - |
| `KAKAO_APP_KEY` | 카카오 JavaScript 키 | - |
| `AWS_ACCESS_KEY_ID` | AWS 액세스 키 | - |
| `AWS_SECRET_ACCESS_KEY` | AWS 시크릿 키 | - |
| `AWS_S3_BUCKET` | S3 버킷 이름 | - |

## API 명세

### 인증
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/verify/send` - 인증 코드 발송
- `GET /api/auth/me` - 내 정보 조회

### 업무
- `POST /api/tasks` - 업무 생성
- `GET /api/tasks` - 업무 목록 조회
- `GET /api/tasks/:id` - 업무 상세 조회
- `POST /api/tasks/:id/apply` - 업무 지원
- `POST /api/tasks/:id/complete` - 완료 보고

### 테스트 (개발 모드 전용)
- `POST /api/test/create-user` - 테스트 계정 생성
- `POST /api/test/seed-data` - 테스트 데이터 생성
- `GET /api/test/accounts` - 테스트 계정 목록
- `POST /api/test/reset` - 테스트 데이터 초기화

전체 API 문서: http://localhost:8000/docs

## 라이선스

MIT License

## 문서

- [PRD](../Doc/PRD.md) - 제품 요구사항 문서
- [TRD](../Doc/TRD.md) - 기술 요구사항 문서
- [Database Design](../Doc/Database%20Design.md) - 데이터베이스 설계
- [Design System](../Doc/Design%20System.md) - 디자인 시스템
- [UserFlow](../Doc/UserFlow.md) - 사용자 흐름
- [인증 보안 가이드](../Doc/인증_보안_가이드.md) - 인증 절차 및 보안
- [로컬 테스트 가이드](../Doc/로컬_테스트_가이드.md) - 테스트 방법
- [EC2 배포 가이드](../Doc/EC2_배포_가이드.md) - 서버 배포 방법
