#!/bin/bash

# Canon Print Management System - 빠른 시작 스크립트

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║   Canon Print Management System 시작                      ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# 환경 변수 파일 체크
if [ ! -f .env ]; then
    echo "⚙️  환경 변수 파일 생성 중..."
    cp .env.example .env
    echo "✅ .env 파일이 생성되었습니다. 필요한 설정을 수정하세요."
fi

# Docker 실행 여부 확인
if ! command -v docker &> /dev/null; then
    echo "❌ Docker가 설치되어 있지 않습니다."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose가 설치되어 있지 않습니다."
    exit 1
fi

# Docker Compose로 전체 시스템 실행
echo ""
echo "🚀 Docker Compose로 시스템 시작 중..."
echo ""

docker-compose up -d

echo ""
echo "⏳ 서비스 초기화 대기 중... (30초)"
sleep 30

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║   ✅ Canon Print Management System 시작 완료              ║"
echo "║                                                           ║"
echo "║   📊 접속 정보:                                           ║"
echo "║                                                           ║"
echo "║   Frontend:      http://localhost:3000                    ║"
echo "║   API Server:    http://localhost:8080                    ║"
echo "║   Swagger UI:    http://localhost:8080/swagger-ui.html    ║"
echo "║   PostgreSQL:    localhost:5432                           ║"
echo "║   Redis:         localhost:6379                           ║"
echo "║                                                           ║"
echo "║   📝 로그 확인:                                           ║"
echo "║   docker-compose logs -f                                  ║"
echo "║                                                           ║"
echo "║   ⏹️  시스템 종료:                                        ║"
echo "║   docker-compose down                                     ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
