Tasks (단계별 개발 문서)
Phase 1: 인프라 및 DB 구축 (초기 세팅)
[ ] AWS EC2 우분투 서버 인스턴스 생성 및 보안 그룹 설정.
[ ] PostgreSQL + PostGIS 설치 및 공간 데이터 확장 설정.
[ ] FastAPI 프로젝트 구조 생성 및 DB 연동 (SQLAlchemy/Tortoise).

Phase 2: 핵심 API 개발 (위치 로직)
[ ] 이모님용 활동 중심지 및 반경 저장 API (base_location, preferred_radius).
[ ] 사용자용 호출 API (업무 위치 저장).
[ ] 공간 쿼리 구현: 호출 위치가 이모님의 반경 내에 있는지 확인하는 매칭 로직.

Phase 3: 프론트엔드 및 지도 연동
[ ] React 기반 가독성 높은 UI 컴포넌트 개발.
[ ] Kakao Maps SDK 연동: 근무할 장소 및 이모님 활동 반경 시각화(원 그리기) 및 마커 표시.
[ ] 실시간 상태 반영을 위한 웹소켓 또는 폴링 연동.

Phase 4: 배포 및 보안
[ ] Nginx 리버스 프록시 설정 및 SSL 인증서 적용.
[ ] GitHub Actions를 통한 자동 배포(CI/CD) 스크립트 작성.
[ ] S3를 이용한 이미지 업로드 기능 연동.