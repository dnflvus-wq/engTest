-- 마이그레이션 스크립트 v2
-- 기존 DB에 새 필드 추가

-- exams 테이블에 mode 필드 추가
ALTER TABLE exams ADD COLUMN IF NOT EXISTS mode VARCHAR(20) DEFAULT 'ONLINE';

-- questions 테이블에 answer_type 필드 추가
ALTER TABLE questions ADD COLUMN IF NOT EXISTS answer_type VARCHAR(20) DEFAULT 'CHOICE';

-- 기본 사용자 추가 (중복 시 무시)
INSERT IGNORE INTO users (id, name) VALUES 
(1, '이성현'), (2, '김주연'), (3, '김은별'), (4, '정하나');
