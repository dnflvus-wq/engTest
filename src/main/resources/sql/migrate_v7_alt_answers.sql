-- migrate_v7_alt_answers.sql
-- 대체 정답 컬럼 추가 (파이프 | 구분자로 복수 대체 정답 저장)

ALTER TABLE questions ADD COLUMN IF NOT EXISTS alt_answers TEXT DEFAULT NULL;

-- 확인
SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'questions' AND COLUMN_NAME = 'alt_answers';
