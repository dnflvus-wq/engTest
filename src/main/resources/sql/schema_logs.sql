-- 활동 로그 테이블
CREATE TABLE IF NOT EXISTS activity_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    user_name VARCHAR(50),
    action VARCHAR(50) NOT NULL,
    target_type VARCHAR(30),
    target_id BIGINT,
    details TEXT,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    request_path VARCHAR(200),
    http_method VARCHAR(10),
    response_status INT,
    duration_ms BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_logs_user (user_id),
    INDEX idx_logs_action (action),
    INDEX idx_logs_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 로그 정책 설정 테이블
CREATE TABLE IF NOT EXISTS log_settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(50) UNIQUE NOT NULL,
    setting_value VARCHAR(200) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 기본 설정값 삽입
INSERT IGNORE INTO log_settings (setting_key, setting_value) VALUES
('retention_days', '90'),
('auto_delete_enabled', 'true'),
('log_login', 'true'),
('log_exam', 'true'),
('log_file', 'true'),
('log_admin', 'true'),
('log_error', 'true');
