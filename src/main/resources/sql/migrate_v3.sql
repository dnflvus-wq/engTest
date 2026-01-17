-- 마이그레이션 스크립트 v3
-- 교육자료 관리 기능 추가

-- 교육자료 테이블 (유튜브, PPT 등)
CREATE TABLE IF NOT EXISTS round_materials (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    round_id BIGINT NOT NULL,
    material_type VARCHAR(20) NOT NULL,
    title VARCHAR(200),
    url VARCHAR(500),
    file_name VARCHAR(200),
    seq_no INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (round_id) REFERENCES rounds(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 단어장 테이블 (문제 생성 시 추출된 단어 저장)
CREATE TABLE IF NOT EXISTS round_vocabulary (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    round_id BIGINT NOT NULL,
    english VARCHAR(200) NOT NULL,
    korean VARCHAR(200),
    phonetic VARCHAR(200),
    seq_no INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (round_id) REFERENCES rounds(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_materials_round_id ON round_materials(round_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_round_id ON round_vocabulary(round_id);
