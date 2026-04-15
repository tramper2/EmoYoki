# 이모~여기! 프론트엔드

중장년층 맞춤형 구인 플랫폼 프론트엔드

## 기술 스택

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: Zustand
- **Data Fetching**: React Query
- **HTTP Client**: Axios
- **Map**: Kakao Maps SDK
- **Styling**: Custom CSS (Design System)

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

```bash
cp .env.example .env
# .env 파일에 필요한 값 입력
```

### 3. 실행

```bash
npm run dev
```

앱이 http://localhost:3000 에서 실행됩니다.

## 프로젝트 구조

```
src/
├── components/      # 재사용 컴포넌트
├── pages/          # 페이지 컴포넌트
├── services/       # API 서비스
├── store/          # 상태 관리
├── types/          # TypeScript 타입
├── utils/          # 유틸리티
├── styles/         # 전역 스타일
└── main.tsx        # 진입점
```

## 주요 기능

- 🔐 휴대폰 인증 기반 회원가입/로그인
- 📍 카카오맵 연동 위치 기반 매칭
- 📝 업무(호출) 생성 및 관리
- 👥 구인자/이모님 대시보드
- ⭐ 리뷰 및 평점 시스템

## 디자인 시스템

- **Primary Color**: #FF8C00 (Orange)
- **Typography**: Pretendard (18px~24px 중심)
- **Accessibility**: 큰 버튼, 높은 대비, 선명한 인터페이스
