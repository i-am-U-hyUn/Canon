# React Frontend Dockerfile
FROM node:18-alpine AS build

WORKDIR /app

# 의존성 설치
COPY package*.json ./
RUN npm ci --silent

# 빌드
COPY . .
RUN npm run build

# Production
FROM nginx:alpine

# Nginx 설정
COPY --from=build /app/build /usr/share/nginx/html

# Nginx 커스텀 설정
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
    location /api { \
        proxy_pass http://spring-api:8080; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
        proxy_cache_bypass $http_upgrade; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
