# 이모~ 여기! (Emo-Here)

중장년층의 연륜을 활용한 생활 밀착형 서비스 플랫폼

## 📋 프로젝트 개요

우리 동네 믿음직한 손길이 필요할 때, **이모~ 여기!**

병원 동행, 강아지 산책, 가사 보조, 가게 땜빵 등 30분 단위 초단기 업무 매칭 서비스

## 🎯 핵심 가치

- **신뢰**: 중장년층의 연륜을 활용한 전문 서비스
- **자율성**: 이모님이 직접 활동 중심지와 반경(2/5/10km) 설정
- **편의성**: 30분 단위의 초단기 업무 및 직관적인 UI

## 🚀 주요 기능

### 구인자 (고용자)
- 구인 공고 게시 (카테고리, 장소, 시간, 금액, 요구사항)
- 지원자 확인 및 연락

### 공급자 (이모님)
- 구인 공고 탐색
- 지원 기능
- 위치 기반 푸시 알림 (추후 구현)

## 🛠 기술 스택

### 프론트엔드
- HTML5
- CSS3
- Vanilla JavaScript

### 백엔드 (추후 구현)
- Python FastAPI
- PostgreSQL + PostGIS (위치 기반 검색)
- Redis (실시간 알림)

### 인프라
- AWS EC2
- AWS S3
- GitHub Pages / Netlify (프론트엔드 호스팅)

## 📦 설치 및 실행

### 로컬 개발

```bash
# 1. 레포지토리 클론
git clone https://github.com/your-username/EmoYoki.git
cd EmoYoki

# 2. 로컬 서버 시작
python3 -m http.server 8001

# 3. 브라우저 접속
# http://localhost:8001
```
https://tramper2.github.io/EmoYoki/

### 개발 서버 실행

```bash
# 포트 8001로 HTTP 서버 시작
python3 -m http.server 8001
```

## 🔧 API 설정

### JSONBin.io (현재 데이터 저장소)

1. **가입**: https://jsonbin.io
2. **API Key 발급**: Settings → API Keys
3. **Bin 생성**: `emo-posts` 이름으로 생성
4. **코드 설정**:
   - `Doc/DBinfo.md`에 API 정보 저장 (.gitignore로 보호)
   - `index.html`에 설정 값 입력

## 👥 테스트 계정

현재 테스트를 위한 **더미 로그인**이 제공됩니다:

| 타입 | 계정 |
|------|------|
| 구인자 | 👩‍💼 구인자 로그인 |
| 공급자 | 👵 이모님 1 로그인 |
| 공급자 | 👵 이모님 2 로그인 |

## 📂 프로젝트 구조

```
EmoYoki/
├── index.html           # 메인 웹페이지
├── Doc/                 # 문서
│   ├── PRD.md          # 제품 요구사항 문서
│   ├── UserFlow.md     # 사용자 흐름
│   └── DBinfo.md       # DB 정보 (Git 미추적)
└── Source/             # 소스 코드
    ├── backend/        # 백엔드 (추후 구현)
    └── frontend/       # 프론트엔드 (추후 구현)
```

## 🚢 배포

### GitHub Pages

1. **레포지토리 설정** → Pages
2. **소스**: `main` 브랜치
3. **폴더**: `/ (root)`
4. **저장** 후 몇 분 기다리면 배포 완료

### Netlify (Private 레포지토리용)

1. **Netlify** 가입 → New site from Git
2. **GitHub 연동**
3. **Build settings**: 없음 (순정 HTML)
4. **Deploy directory**: `/`
5. **Deploy site**

## 📝 라이선스

Copyright © 2026 Emo-Here Team

---

**서비스명**: 이모~ 여기! (Emo-Here)
**슬로건**: "우리 동네 믿음직한 손길이 필요할 때, 이모~ 여기!"
