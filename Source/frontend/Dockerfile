FROM node:20-alpine AS builder

WORKDIR /app

# 의존성 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci

# 소스 복사
COPY . .

# 빌드
RUN npm run build

# nginx 배포
FROM nginx:alpine

# 빌드 결과 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# nginx 설정 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
