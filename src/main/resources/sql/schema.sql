-- 영어 시험 시스템 DB 스키마 v2

-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_users_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 기본 사용자 추가
INSERT IGNORE INTO users (id, name) VALUES 
(1, '이성현'), (2, '김주연'), (3, '김은별'), (4, '정하나');

-- 회차 테이블
CREATE TABLE IF NOT EXISTS rounds (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    question_count INT DEFAULT 20,
    difficulty VARCHAR(20) DEFAULT 'MEDIUM',
    status VARCHAR(20) DEFAULT 'ACTIVE',
    pass_score INT DEFAULT 24,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 문제 테이블
CREATE TABLE IF NOT EXISTS questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    round_id BIGINT NOT NULL,
    question_type VARCHAR(20) NOT NULL,
    answer_type VARCHAR(20) DEFAULT 'CHOICE',
    question_text VARCHAR(500) NOT NULL,
    answer VARCHAR(500) NOT NULL,
    option1 VARCHAR(200),
    option2 VARCHAR(200),
    option3 VARCHAR(200),
    option4 VARCHAR(200),
    hint TEXT,
    seq_no INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (round_id) REFERENCES rounds(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 시험 응시 기록 테이블
CREATE TABLE IF NOT EXISTS exams (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    round_id BIGINT NOT NULL,
    mode VARCHAR(20) DEFAULT 'ONLINE',
    total_count INT NOT NULL,
    correct_count INT DEFAULT 0,
    score DECIMAL(5,2) DEFAULT 0,
    is_passed BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'IN_PROGRESS',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (round_id) REFERENCES rounds(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 개별 답안 테이블
CREATE TABLE IF NOT EXISTS exam_answers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    exam_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    user_answer VARCHAR(500),
    is_correct BOOLEAN DEFAULT FALSE,
    ocr_raw_text VARCHAR(500),
    image_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 통계 뷰 (회차별 평균)
CREATE OR REPLACE VIEW v_round_stats AS
SELECT
    r.id AS round_id,
    r.title AS round_title,
    COUNT(DISTINCT e.id) AS exam_count,
    COUNT(DISTINCT e.user_id) AS user_count,
    ROUND(AVG(e.score), 2) AS avg_score,
    MAX(e.score) AS max_score,
    MIN(e.score) AS min_score
FROM rounds r
LEFT JOIN exams e ON r.id = e.round_id AND e.status = 'COMPLETED'
GROUP BY r.id, r.title;

-- 통계 뷰 (사용자별)
CREATE OR REPLACE VIEW v_user_stats AS
SELECT
    u.id AS user_id,
    u.name AS user_name,
    COUNT(e.id) AS total_exams,
    ROUND(AVG(e.score), 2) AS avg_score,
    MAX(e.score) AS max_score
FROM users u
LEFT JOIN exams e ON u.id = e.user_id AND e.status = 'COMPLETED'
GROUP BY u.id, u.name;

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_questions_round_id ON questions(round_id);
CREATE INDEX IF NOT EXISTS idx_exams_user_id ON exams(user_id);
CREATE INDEX IF NOT EXISTS idx_exams_round_id ON exams(round_id);
CREATE INDEX IF NOT EXISTS idx_exam_answers_exam_id ON exam_answers(exam_id);
