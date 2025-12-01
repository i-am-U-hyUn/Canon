# Spring Boot API Server Dockerfile
FROM eclipse-temurin:17-jdk-alpine AS builder

WORKDIR /app

# Maven Wrapper와 pom.xml 복사
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# 의존성 다운로드 (캐싱 최적화)
RUN ./mvnw dependency:go-offline -B

# 소스 코드 복사
COPY src src

# 빌드
RUN ./mvnw package -DskipTests

# Runtime Stage
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# 빌드된 JAR 복사
COPY --from=builder /app/target/*.jar app.jar

# 포트 노출
EXPOSE 8080

# Health Check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# 실행
ENTRYPOINT ["java", "-jar", "app.jar"]
