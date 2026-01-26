-- 복습 문제 기능 추가를 위한 마이그레이션 v4

-- questions 테이블에 is_review 컬럼 추가
ALTER TABLE questions ADD COLUMN IF NOT EXISTS is_review BOOLEAN DEFAULT FALSE;

-- 인덱스 추가 (복습 문제 조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_questions_is_review ON questions(round_id, is_review);
