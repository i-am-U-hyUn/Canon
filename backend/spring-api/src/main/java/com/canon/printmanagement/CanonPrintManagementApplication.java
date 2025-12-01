package com.canon.printmanagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Canon Print Management System - Main Application
 * 
 * 캐논 복합기 통합 출력 관리 시스템
 * - 출력량/비용 대시보드
 * - 장비 모니터링 (Fleet Management)
 * - 비용 절감 자동 정책
 * 
 * @author Canon Korea Solutions Team
 * @version 1.0.0
 */
@SpringBootApplication
@EnableCaching
@EnableScheduling
@EnableJpaAuditing
public class CanonPrintManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(CanonPrintManagementApplication.class, args);
        
        System.out.println("""
            
            ╔═══════════════════════════════════════════════════════════╗
            ║                                                           ║
            ║   Canon Print Management System API Server Started       ║
            ║                                                           ║
            ║   Swagger UI: http://localhost:8080/swagger-ui.html      ║
            ║   API Docs:   http://localhost:8080/api-docs             ║
            ║                                                           ║
            ╚═══════════════════════════════════════════════════════════╝
            
            """);
    }
}
