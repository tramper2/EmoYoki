# EC2 배포 가이드

이모~여기! 서비스를 AWS EC2에 배포하는 방법

## 🚀 빠른 배포

### 1. EC2 인스턴스 생성

**AWS Console 접속**
1. EC2 대시보드 → 인스턴스 시작
2. 설정:
   - **AMI**: Ubuntu Server 22.04 LTS
   - **인스턴스 유형**: t3.medium (최소 2vCPU, 4GB RAM)
   - **키 페어**: 새 키 페어 생성 (다운로드 보관!)
   - **네트워크**:
     - 퍼블릭 IP 자동 할당: 활성화
     - 보안 그룹: HTTP(80), HTTPS(443), SSH(22) 열기

### 2. EC2 접속

```bash
# 키 페어 권한 설정
chmod 400 your-key.pem

# EC2 접속
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

### 3. 배포 스크립트 실행

```bash
# 스크립트 다운로드
curl -O https://raw.githubusercontent.com/your-repo/main/deploy.sh

# 실행 권한 부여
chmod +x deploy.sh

# 배포 실행
./deploy.sh
```

---

## 📋 수동 배포

### 1. Docker 설치

```bash
# Docker 설치
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Docker Compose 설치
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 사용자 권한 추가
sudo usermod -aG docker ubuntu
newgrp docker
```

### 2. 프로젝트 클론

```bash
# Git 설치
sudo apt-get update
sudo apt-get install -y git

# 프로젝트 클론
git clone YOUR_GIT_REPO_URL /var/www/emo-here
cd /var/www/emo-here
```

### 3. 환경 설정

```bash
# .env 파일 생성
cp .env.example .env

# 편집기로 설정
nano .env
```

필수 설정값:
```bash
# Database
POSTGRES_USER=emo_user
POSTGRES_PASSWORD=strong_password_here
POSTGRES_DB=emo_here

# JWT
SECRET_KEY=ranom_secret_key_here

# Kakao (개발용 키도 가능)
KAKAO_REST_API_KEY=your_kakao_key
KAKAO_APP_KEY=your_kakao_js_key

# AWS S3 (이미지 업로드)
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET=emo-here-uploads

# 테스트 모드
TEST_MODE=true
```

### 4. 서비스 시작

```bash
# Docker Compose로 실행
docker-compose up -d --build

# 로그 확인
docker-compose logs -f
```

### 5. Nginx 설정

```bash
# Nginx 설치
sudo apt-get install -y nginx

# 설정 파일 생성
sudo nano /etc/nginx/sites-available/emo-here
```

Nginx 설정:
```nginx
server {
    listen 80;
    server_name YOUR_EC2_PUBLIC_IP;

    # 프론트엔드
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # 백엔드 API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }

    # Swagger UI
    location /docs {
        proxy_pass http://localhost:8000/docs;
        proxy_set_header Host $host;
    }
}
```

```bash
# 사이트 활성화
sudo ln -s /etc/nginx/sites-available/emo-here /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. 테스트 데이터 생성

```bash
# 컨테이너 내에서 실행
docker-compose exec backend python -c "
import asyncio
from httpx import AsyncClient

async def create_test_data():
    async with AsyncClient(base_url='http://localhost:8000') as client:
        response = await client.post('/test/seed-data')
        print(response.json())

asyncio.run(create_test_data())
"
```

또는 API로:
```bash
curl -X POST http://YOUR_EC2_PUBLIC_IP/api/test/seed-data
```

---

## 🔐 SSL 인증서 (선택사항)

### 도메인이 있는 경우

```bash
# Certbot 설치
sudo apt-get install -y certbot python3-certbot-nginx

# 인증서 발급
sudo certbot --nginx -d your-domain.com

# 자동 갱신
sudo certbot renew --dry-run
```

---

## 📊 서비스 확인

### 상태 확인

```bash
# 컨테이너 상태
docker-compose ps

# 로그 확인
docker-compose logs -f backend
docker-compose logs -f frontend

# DB 접속
docker-compose exec postgres psql -U emo_user -d emo_here
```

### 재시작

```bash
# 전체 재시작
docker-compose restart

# 특정 서비스만
docker-compose restart backend
docker-compose restart frontend
```

---

## 🧪 테스트 접속

배포 후 다음 주소로 접속:

- **프론트엔드**: `http://YOUR_EC2_PUBLIC_IP`
- **API 문서**: `http://YOUR_EC2_PUBLIC_IP/docs`
- **테스트 페이지**: `http://YOUR_EC2_PUBLIC_IP/test`

### 테스트 계정

| 역할 | 전화번호 | 비밀번호 |
|------|----------|----------|
| 구인자 | 01000000001 | test1234 |
| 프리미엄 이모님 | 01000000201 | test1234 |
| 일반 이모님 | 01000000401 | test1234 |

---

## 🔧 문제 해결

### 1. 컨테이너가 시작하지 않음

```bash
# 로그 확인
docker-compose logs backend

# 권한 문제
sudo chown -R $USER:$USER /var/www/emo-here

# 포트 충돌 확인
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :8000
```

### 2. 데이터베이스 연결 실패

```bash
# DB 컨테이너 상태 확인
docker-compose ps postgres

# DB 로그 확인
docker-compose logs postgres

# DB 재시작
docker-compose restart postgres
```

### 3. Nginx 502 에러

```bash
# 백엔드 실행 확인
curl http://localhost:8000/health

# Nginx 설정 확인
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx
```

### 4. 테스트 데이터 생성 실패

```bash
# 수동으로 API 호출
docker-compose exec backend curl -X POST http://localhost:8000/test/seed-data

# DB 확인
docker-compose exec postgres psql -U emo_user -d emo_here -c "SELECT * FROM emo_user;"
```

---

## 📝 배포 후 체크리스트

- [ ] EC2 인스턴스 접속 가능
- [ ] Docker 컨테이너 정상 실행
- [ ] Nginx 프록시 설정 완료
- [ ] 프론트엔드 접속 가능
- [ ] API 문서 접속 가능
- [ ] 테스트 데이터 생성 완료
- [ ] 빠른 로그인 기능 작동
- [ ] SSL 인증서 설치 (선택)

---

## 💰 비용 최적화

### 개발/테스트용

- **인스턴스**: t3.medium ($15/월)
- **스토리지**: gp2 20GB ($2/월)
- **데이터 전송**: 1GB 무료
- **예상 월 비용**: $20 ~ $25

### 운영용

- **인스턴스**: t3.large ($30/월) 또는 t3.xlarge ($60/월)
- **스토리지**: gp2 50GB ($5/월)
- **데이터 전송**: 1TB 초과 시 비용 발생
- **예상 월 비용**: $50 ~ $100

### 비용 절감 팁

1. **Reserved Instance**: 1년 약정 시 30~40% 할인
2. **Spot Instance**: 테스트 환경용으로 70~90% 할인
3. **Auto Scaling**: 트래픽에 따라 자동 확장/축소
4. **CloudFront**: 정적 리소스 CDN으로 전송 비용 절감

---

## 🚀 운영 모드 전환

테스트가 완료되면 운영 모드로 전환:

```bash
# .env 파일 수정
nano /var/www/emo-here/.env

# TEST_MODE=false로 변경
TEST_MODE=false

# 재시작
docker-compose restart backend
docker-compose restart frontend
```

---

## 📞 도움이 필요하시면

- 배포 스크립트: `deploy.sh`
- 로컬 테스트 가이드: [로컬_테스트_가이드.md](로컬_테스트_가이드.md)
- 이슈 트래커: GitHub Issues
