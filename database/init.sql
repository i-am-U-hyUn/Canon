-- Canon Print Management System Database Schema
-- PostgreSQL 16 + TimescaleDB

-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- ============================================
-- 1. 사용자 및 조직 관리
-- ============================================

-- 부서 테이블
CREATE TABLE departments (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    parent_department_id BIGINT REFERENCES departments(id),
    monthly_budget DECIMAL(12, 2), -- 월간 출력 예산
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 사용자 테이블
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    department_id BIGINT REFERENCES departments(id),
    role VARCHAR(50) DEFAULT 'USER', -- USER, MANAGER, ADMIN
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. 프린터/복합기 관리
-- ============================================

-- 프린터 모델 정보
CREATE TABLE printer_models (
    id BIGSERIAL PRIMARY KEY,
    manufacturer VARCHAR(100) DEFAULT 'Canon',
    model_name VARCHAR(200) NOT NULL,
    model_code VARCHAR(100) UNIQUE NOT NULL,
    is_color BOOLEAN DEFAULT true,
    is_duplex_capable BOOLEAN DEFAULT true,
    max_paper_capacity INT DEFAULT 500,
    toner_capacity_black INT,
    toner_capacity_cyan INT,
    toner_capacity_magenta INT,
    toner_capacity_yellow INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 프린터 장비 정보
CREATE TABLE printers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    ip_address INET NOT NULL,
    mac_address MACADDR,
    model_id BIGINT REFERENCES printer_models(id),
    location VARCHAR(255),
    department_id BIGINT REFERENCES departments(id),
    installation_date DATE,
    snmp_community VARCHAR(100) DEFAULT 'public',
    snmp_version VARCHAR(10) DEFAULT 'v2c', -- v1, v2c, v3
    is_active BOOLEAN DEFAULT true,
    last_seen_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 프린터 상태 (실시간 - TimescaleDB Hypertable)
CREATE TABLE printer_status (
    printer_id BIGINT NOT NULL REFERENCES printers(id),
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL, -- ONLINE, OFFLINE, ERROR, WARNING
    toner_level_black INT, -- 0-100%
    toner_level_cyan INT,
    toner_level_magenta INT,
    toner_level_yellow INT,
    paper_level INT, -- 0-100%
    error_code VARCHAR(50),
    error_message TEXT,
    total_page_count BIGINT,
    color_page_count BIGINT,
    PRIMARY KEY (printer_id, timestamp)
);

-- TimescaleDB hypertable로 변환
SELECT create_hypertable('printer_status', 'timestamp', 
    chunk_time_interval => INTERVAL '1 day',
    if_not_exists => TRUE
);

-- 자동 데이터 보관 정책 (90일 이상 데이터는 압축)
SELECT add_retention_policy('printer_status', INTERVAL '90 days', if_not_exists => TRUE);

-- ============================================
-- 3. 출력 작업 관리
-- ============================================

-- 출력 작업 (TimescaleDB Hypertable)
CREATE TABLE print_jobs (
    id BIGSERIAL,
    job_id VARCHAR(100) NOT NULL,
    printer_id BIGINT NOT NULL REFERENCES printers(id),
    user_id BIGINT NOT NULL REFERENCES users(id),
    department_id BIGINT NOT NULL REFERENCES departments(id),
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    document_name VARCHAR(500),
    file_size_kb BIGINT,
    page_count INT NOT NULL,
    color_page_count INT DEFAULT 0,
    bw_page_count INT DEFAULT 0,
    is_duplex BOOLEAN DEFAULT false,
    copies INT DEFAULT 1,
    paper_size VARCHAR(20) DEFAULT 'A4', -- A4, A3, Letter
    status VARCHAR(50) DEFAULT 'COMPLETED', -- PENDING, PRINTING, COMPLETED, FAILED, CANCELLED
    cost_bw DECIMAL(10, 2),
    cost_color DECIMAL(10, 2),
    total_cost DECIMAL(10, 2),
    was_color_converted BOOLEAN DEFAULT false, -- 컬러→흑백 자동 변환 여부
    was_duplex_enforced BOOLEAN DEFAULT false, -- 양면 출력 강제 여부
    policy_applied VARCHAR(100), -- 적용된 정책 이름
    PRIMARY KEY (id, timestamp)
);

-- TimescaleDB hypertable로 변환
SELECT create_hypertable('print_jobs', 'timestamp',
    chunk_time_interval => INTERVAL '7 days',
    if_not_exists => TRUE
);

-- Continuous Aggregate: 일별 통계 (자동 생성)
CREATE MATERIALIZED VIEW print_jobs_daily
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('1 day', timestamp) AS day,
    printer_id,
    user_id,
    department_id,
    COUNT(*) AS total_jobs,
    SUM(page_count) AS total_pages,
    SUM(color_page_count) AS total_color_pages,
    SUM(bw_page_count) AS total_bw_pages,
    SUM(total_cost) AS total_cost,
    COUNT(*) FILTER (WHERE was_color_converted = true) AS color_converted_count,
    COUNT(*) FILTER (WHERE was_duplex_enforced = true) AS duplex_enforced_count
FROM print_jobs
GROUP BY day, printer_id, user_id, department_id
WITH NO DATA;

-- 리프레시 정책 (1시간마다 자동 업데이트)
SELECT add_continuous_aggregate_policy('print_jobs_daily',
    start_offset => INTERVAL '3 days',
    end_offset => INTERVAL '1 hour',
    schedule_interval => INTERVAL '1 hour',
    if_not_exists => TRUE
);

-- ============================================
-- 4. 알림 및 이벤트 관리
-- ============================================

-- 알림 규칙
CREATE TABLE alert_rules (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    rule_type VARCHAR(50) NOT NULL, -- TONER_LOW, PAPER_LOW, ERROR, COST_THRESHOLD
    condition_json JSONB NOT NULL, -- {"toner_threshold": 10, "color": "black"}
    severity VARCHAR(20) DEFAULT 'INFO', -- INFO, WARNING, ERROR, CRITICAL
    notification_channels TEXT[], -- ['email', 'slack', 'teams']
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 알림 히스토리
CREATE TABLE alerts (
    id BIGSERIAL PRIMARY KEY,
    alert_rule_id BIGINT REFERENCES alert_rules(id),
    printer_id BIGINT REFERENCES printers(id),
    department_id BIGINT REFERENCES departments(id),
    severity VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data_json JSONB,
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP,
    resolved_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. 정책 관리
-- ============================================

-- 출력 정책
CREATE TABLE print_policies (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    policy_type VARCHAR(50) NOT NULL, -- COLOR_TO_BW, FORCE_DUPLEX, QUOTA, APPROVAL_REQUIRED
    target_type VARCHAR(50) NOT NULL, -- DEPARTMENT, USER, PRINTER, GLOBAL
    target_id BIGINT, -- department_id, user_id, printer_id
    config_json JSONB NOT NULL, -- {"color_threshold": 0.1, "auto_convert": true}
    priority INT DEFAULT 0, -- 우선순위 (높을수록 우선)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 할당량 관리
CREATE TABLE quotas (
    id BIGSERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL, -- DEPARTMENT, USER
    entity_id BIGINT NOT NULL,
    period VARCHAR(20) DEFAULT 'MONTHLY', -- DAILY, WEEKLY, MONTHLY
    max_pages INT,
    max_color_pages INT,
    max_cost DECIMAL(12, 2),
    current_pages INT DEFAULT 0,
    current_color_pages INT DEFAULT 0,
    current_cost DECIMAL(12, 2) DEFAULT 0,
    reset_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 6. 인덱스 생성 (성능 최적화)
-- ============================================

-- 출력 작업 조회 인덱스
CREATE INDEX idx_print_jobs_user_id ON print_jobs(user_id, timestamp DESC);
CREATE INDEX idx_print_jobs_department_id ON print_jobs(department_id, timestamp DESC);
CREATE INDEX idx_print_jobs_printer_id ON print_jobs(printer_id, timestamp DESC);
CREATE INDEX idx_print_jobs_status ON print_jobs(status, timestamp DESC);

-- 프린터 상태 조회 인덱스
CREATE INDEX idx_printer_status_printer_id ON printer_status(printer_id, timestamp DESC);
CREATE INDEX idx_printer_status_status ON printer_status(status, timestamp DESC);

-- 알림 조회 인덱스
CREATE INDEX idx_alerts_printer_id ON alerts(printer_id, created_at DESC);
CREATE INDEX idx_alerts_department_id ON alerts(department_id, created_at DESC);
CREATE INDEX idx_alerts_is_resolved ON alerts(is_resolved, created_at DESC);

-- ============================================
-- 7. 초기 데이터 삽입
-- ============================================

-- 부서 데이터
INSERT INTO departments (name, code, monthly_budget) VALUES
('경영지원팀', 'MGT', 500000),
('개발팀', 'DEV', 800000),
('마케팅팀', 'MKT', 600000),
('영업팀', 'SALES', 700000);

-- 사용자 데이터
INSERT INTO users (username, email, full_name, department_id, role) VALUES
('admin', 'admin@canon.co.kr', '시스템 관리자', 1, 'ADMIN'),
('kim.dev', 'kim.dev@canon.co.kr', '김개발', 2, 'USER'),
('park.mkt', 'park.mkt@canon.co.kr', '박마케팅', 3, 'MANAGER'),
('lee.sales', 'lee.sales@canon.co.kr', '이영업', 4, 'USER');

-- 프린터 모델 데이터 (Canon 복합기)
INSERT INTO printer_models (manufacturer, model_name, model_code, is_color, is_duplex_capable, 
    toner_capacity_black, toner_capacity_cyan, toner_capacity_magenta, toner_capacity_yellow) VALUES
('Canon', 'imageRUNNER ADVANCE C5535i', 'iR-ADV-C5535i', true, true, 28000, 19000, 19000, 19000),
('Canon', 'imageRUNNER ADVANCE DX 4725i', 'iR-ADV-DX-4725i', true, true, 25000, 17000, 17000, 17000),
('Canon', 'imageRUNNER 2625i', 'iR-2625i', false, true, 18000, 0, 0, 0);

-- 프린터 장비 데이터
INSERT INTO printers (name, serial_number, ip_address, model_id, location, department_id) VALUES
('본사-복합기-1F', 'CAC5535I-001', '192.168.1.101', 1, '본사 1층 로비', 1),
('본사-복합기-3F-개발팀', 'CADX4725I-002', '192.168.1.103', 2, '본사 3층 개발실', 2),
('본사-복합기-4F-마케팅', 'CAC5535I-003', '192.168.1.104', 1, '본사 4층 마케팅실', 3),
('본사-복합기-5F-영업팀', 'CAR2625I-004', '192.168.1.105', 3, '본사 5층 영업실', 4);

-- 알림 규칙 데이터
INSERT INTO alert_rules (name, rule_type, condition_json, severity, notification_channels) VALUES
('토너 부족 알림', 'TONER_LOW', '{"threshold": 15, "colors": ["black", "cyan", "magenta", "yellow"]}', 'WARNING', ARRAY['email', 'slack']),
('용지 부족 알림', 'PAPER_LOW', '{"threshold": 20}', 'INFO', ARRAY['email']),
('프린터 오류', 'ERROR', '{"error_types": ["PAPER_JAM", "HARDWARE_ERROR"]}', 'ERROR', ARRAY['email', 'slack', 'teams']),
('부서 예산 초과', 'COST_THRESHOLD', '{"threshold_percentage": 90}', 'WARNING', ARRAY['email']);

-- 출력 정책 데이터
INSERT INTO print_policies (name, description, policy_type, target_type, config_json, priority) VALUES
('전사 컬러→흑백 자동 변환', '이미지 비율 10% 미만 문서는 자동으로 흑백 출력', 'COLOR_TO_BW', 'GLOBAL', 
    '{"enabled": true, "image_threshold": 0.1, "auto_convert": true}', 10),
('전사 양면 출력 강제', '환경 정책에 따라 모든 출력 작업은 양면 출력', 'FORCE_DUPLEX', 'GLOBAL',
    '{"enabled": true, "exceptions": ["A3", "PHOTO"]}', 5),
('영업팀 컬러 출력 승인 필요', '영업팀은 10페이지 이상 컬러 출력 시 관리자 승인 필요', 'APPROVAL_REQUIRED', 'DEPARTMENT',
    '{"enabled": true, "color_page_threshold": 10}', 15);

-- 할당량 설정
INSERT INTO quotas (entity_type, entity_id, period, max_pages, max_color_pages, max_cost, reset_date) VALUES
('DEPARTMENT', 2, 'MONTHLY', 10000, 2000, 800000, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'),
('DEPARTMENT', 3, 'MONTHLY', 8000, 3000, 600000, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'),
('USER', 2, 'MONTHLY', 500, 50, 50000, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month');

-- ============================================
-- 8. 뷰 생성 (리포팅용)
-- ============================================

-- 부서별 출력 통계 뷰
CREATE VIEW v_department_print_stats AS
SELECT
    d.id AS department_id,
    d.name AS department_name,
    d.code AS department_code,
    COUNT(pj.id) AS total_jobs,
    SUM(pj.page_count) AS total_pages,
    SUM(pj.color_page_count) AS total_color_pages,
    SUM(pj.bw_page_count) AS total_bw_pages,
    SUM(pj.total_cost) AS total_cost,
    d.monthly_budget,
    ROUND((SUM(pj.total_cost) / NULLIF(d.monthly_budget, 0) * 100), 2) AS budget_usage_percentage
FROM departments d
LEFT JOIN print_jobs pj ON d.id = pj.department_id
    AND pj.timestamp >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY d.id, d.name, d.code, d.monthly_budget;

-- 프린터 상태 요약 뷰
CREATE VIEW v_printer_status_summary AS
SELECT
    p.id AS printer_id,
    p.name AS printer_name,
    p.serial_number,
    p.ip_address,
    pm.model_name,
    p.location,
    d.name AS department_name,
    ps.status,
    ps.toner_level_black,
    ps.toner_level_cyan,
    ps.toner_level_magenta,
    ps.toner_level_yellow,
    ps.paper_level,
    ps.error_message,
    ps.timestamp AS last_update
FROM printers p
JOIN printer_models pm ON p.model_id = pm.id
LEFT JOIN departments d ON p.department_id = d.id
LEFT JOIN LATERAL (
    SELECT * FROM printer_status
    WHERE printer_id = p.id
    ORDER BY timestamp DESC
    LIMIT 1
) ps ON true
WHERE p.is_active = true;

-- ============================================
-- 9. 트리거 함수 (자동화)
-- ============================================

-- updated_at 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 각 테이블에 트리거 적용
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_printers_updated_at BEFORE UPDATE ON printers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 할당량 자동 차감 트리거
CREATE OR REPLACE FUNCTION update_quota_on_print()
RETURNS TRIGGER AS $$
BEGIN
    -- 사용자 할당량 업데이트
    UPDATE quotas
    SET current_pages = current_pages + NEW.page_count,
        current_color_pages = current_color_pages + NEW.color_page_count,
        current_cost = current_cost + NEW.total_cost
    WHERE entity_type = 'USER' AND entity_id = NEW.user_id
        AND reset_date > CURRENT_DATE;
    
    -- 부서 할당량 업데이트
    UPDATE quotas
    SET current_pages = current_pages + NEW.page_count,
        current_color_pages = current_color_pages + NEW.color_page_count,
        current_cost = current_cost + NEW.total_cost
    WHERE entity_type = 'DEPARTMENT' AND entity_id = NEW.department_id
        AND reset_date > CURRENT_DATE;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_quota_on_print
AFTER INSERT ON print_jobs
FOR EACH ROW EXECUTE FUNCTION update_quota_on_print();

-- ============================================
-- 완료
-- ============================================

-- 권한 설정
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO canon_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO canon_admin;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO canon_admin;

-- 완료 메시지
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Canon Print Management Database 초기화 완료!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '부서: % 개', (SELECT COUNT(*) FROM departments);
    RAISE NOTICE '사용자: % 개', (SELECT COUNT(*) FROM users);
    RAISE NOTICE '프린터 모델: % 개', (SELECT COUNT(*) FROM printer_models);
    RAISE NOTICE '프린터: % 개', (SELECT COUNT(*) FROM printers);
    RAISE NOTICE '알림 규칙: % 개', (SELECT COUNT(*) FROM alert_rules);
    RAISE NOTICE '출력 정책: % 개', (SELECT COUNT(*) FROM print_policies);
    RAISE NOTICE '========================================';
END $$;
