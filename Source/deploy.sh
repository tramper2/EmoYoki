#!/bin/bash

# 이모~여기! EC2 배포 스크립트

set -e

echo "🚀 이모~여기! 배포 시작..."

# 변수 설정
PROJECT_NAME="emo-here"
DEPLOY_PATH="/var/www/$PROJECT_NAME"
GIT_REPO="your-git-repo-url"  # Git 저장소 URL로 변경
BRANCH="main"

# 1. 시스템 업데이트
echo "📦 시스템 업데이트..."
sudo apt-get update && sudo apt-get upgrade -y

# 2. 필수 패키지 설치
echo "📦 필수 패키지 설치..."
sudo apt-get install -y \
    git \
    curl \
    wget \
    nginx \
    certbot \
    python3-certbot-nginx \
    docker.io \
    docker-compose \
    postgresql-client \
    build-essential

# 3. Docker 권한 설정
sudo usermod -aG docker $USER
newgrp docker

# 4. 프로젝트 디렉토리 생성
sudo mkdir -p $DEPLOY_PATH
sudo chown -R $USER:$USER $DEPLOY_PATH

# 5. Git에서 프로젝트 클론 (또는 풀)
if [ -d "$DEPLOY_PATH/.git" ]; then
    echo "📥 Git에서 업데이트 가져오기..."
    cd $DEPLOY_PATH
    git pull origin $BRANCH
else
    echo "📥 Git에서 프로젝트 클론..."
    git clone -b $BRANCH $GIT_REPO $DEPLOY_PATH
    cd $DEPLOY_PATH
fi

# 6. 환경 변수 파일 생성
if [ ! -f "$DEPLOY_PATH/.env" ]; then
    echo "🔧 환경 변수 파일 생성..."
    cp $DEPLOY_PATH/.env.example $DEPLOY_PATH/.env

    # 랜덤 시크릿 키 생성
    SECRET_KEY=$(openssl rand -hex 32)
    sed -i "s/SECRET_KEY=.*/SECRET_KEY=$SECRET_KEY/" $DEPLOY_PATH/.env

    echo "⚠️ .env 파일을 수정하여 실제 설정값을 입력하세요!"
    echo "   - KAKAO_REST_API_KEY"
    echo "   - KAKAO_APP_KEY"
    echo "   - AWS_ACCESS_KEY_ID"
    echo "   - AWS_SECRET_ACCESS_KEY"
fi

# 7. Docker Compose로 서비스 시작
echo "🐳 Docker 컨테이너 시작..."
cd $DEPLOY_PATH
docker-compose down
docker-compose up -d --build

# 8. 데이터베이스 초기화 대기
echo "⏳ 데이터베이스 초기화 대기..."
sleep 10

# 9. 테스트 데이터 생성 (테스트 모드)
echo "🧪 테스트 데이터 생성..."
curl -X POST http://localhost:8000/test/seed-data

# 10. Nginx 설정
echo "🌐 Nginx 설정..."
sudo tee /etc/nginx/sites-available/$PROJECT_NAME > /dev/null <<EOF
server {
    listen 80;
    server_name $(hostname -I | awk '{print $1}');  # EC2 공인 IP로 변경

    # 프론트엔드
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # 백엔드 API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # Swagger
    location /docs {
        proxy_pass http://localhost:8000/docs;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
    }
}
EOF

# 11. Nginx 사이트 활성화
sudo ln -sf /etc/nginx/sites-available/$PROJECT_NAME /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 12. 방화벽 설정
echo "🔥 방화벽 설정..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# 13. SSL 인증서 (선택사항)
read -p "SSL 인증서를 설치하시겠습니까? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    sudo certbot --nginx -d your-domain.com  # 도메인으로 변경
fi

echo ""
echo "✅ 배포 완료!"
echo ""
echo "접속 정보:"
echo "  - 프론트엔드: http://$(hostname -I | awk '{print $1}')"
echo "  - API 문서: http://$(hostname -I | awk '{print $1}')/docs"
echo "  - 테스트 페이지: http://$(hostname -I | awk '{print $1}')/test"
echo ""
echo "테스트 계정:"
echo "  - 구인자: 01000000001 / test1234"
echo "  - 프리미엄 이모님: 01000000201 / test1234"
echo "  - 일반 이모님: 01000000401 / test1234"
echo ""
echo "로그 확인:"
echo "  docker-compose logs -f"
echo "  docker-compose logs -f backend"
echo "  docker-compose logs -f frontend"
