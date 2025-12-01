# .NET Monitoring Agent Dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src

# 프로젝트 파일 복사 및 복원
COPY CanonMonitoringAgent/CanonMonitoringAgent.csproj CanonMonitoringAgent/
RUN dotnet restore "CanonMonitoringAgent/CanonMonitoringAgent.csproj"

# 소스 코드 복사 및 빌드
COPY . .
WORKDIR "/src/CanonMonitoringAgent"
RUN dotnet build "CanonMonitoringAgent.csproj" -c Release -o /app/build

# 퍼블리시
FROM build AS publish
RUN dotnet publish "CanonMonitoringAgent.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime
FROM mcr.microsoft.com/dotnet/runtime:8.0

WORKDIR /app

# 필요한 도구 설치 (네트워크 유틸리티)
RUN apt-get update && apt-get install -y \
    iputils-ping \
    snmp \
    && rm -rf /var/lib/apt/lists/*

COPY --from=publish /app/publish .

# 포트 노출 (필요시)
EXPOSE 5000

ENTRYPOINT ["dotnet", "CanonMonitoringAgent.dll"]
