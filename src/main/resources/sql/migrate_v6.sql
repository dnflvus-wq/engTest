-- 마이그레이션 스크립트 v6
-- 업적(Achievement) & 뱃지(Badge) 시스템 추가

-- ====================================
-- 1. 업적 마스터 테이블
-- ====================================
CREATE TABLE IF NOT EXISTS achievements (
    id VARCHAR(50) PRIMARY KEY,
    category VARCHAR(30) NOT NULL,
    name_kr VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    description_kr VARCHAR(500) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    is_hidden BOOLEAN DEFAULT FALSE,
    is_tiered BOOLEAN DEFAULT FALSE,
    tier_thresholds TEXT,
    grants_badge_at VARCHAR(20),
    badge_id VARCHAR(50),
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ====================================
-- 2. 뱃지 마스터 테이블
-- ====================================
CREATE TABLE IF NOT EXISTS badges (
    id VARCHAR(50) PRIMARY KEY,
    achievement_id VARCHAR(50) NOT NULL,
    name_kr VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    description_kr VARCHAR(500),
    icon VARCHAR(50) NOT NULL,
    rarity VARCHAR(20) NOT NULL,
    profile_effect VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ====================================
-- 3. 사용자별 달성 업적
-- ====================================
CREATE TABLE IF NOT EXISTS user_achievements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    achievement_id VARCHAR(50) NOT NULL,
    tier VARCHAR(20),
    current_value INT DEFAULT 0,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_notified BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (achievement_id) REFERENCES achievements(id),
    UNIQUE KEY uk_user_achievement_tier (user_id, achievement_id, tier)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ====================================
-- 4. 사용자별 뱃지 (장착 상태 포함)
-- ====================================
CREATE TABLE IF NOT EXISTS user_badges (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    badge_id VARCHAR(50) NOT NULL,
    slot_number INT,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (badge_id) REFERENCES badges(id),
    UNIQUE KEY uk_user_badge (user_id, badge_id),
    UNIQUE KEY uk_user_slot (user_id, slot_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ====================================
-- 5. 사용자 행동 카운터
-- ====================================
CREATE TABLE IF NOT EXISTS user_action_counters (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL,
    count INT DEFAULT 0,
    last_performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY uk_user_action (user_id, action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ====================================
-- 6. 업적 진행도 캐시
-- ====================================
CREATE TABLE IF NOT EXISTS achievement_progress (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    achievement_id VARCHAR(50) NOT NULL,
    current_value INT DEFAULT 0,
    target_value INT NOT NULL,
    next_tier VARCHAR(20),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (achievement_id) REFERENCES achievements(id),
    UNIQUE KEY uk_user_progress (user_id, achievement_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ====================================
-- 인덱스
-- ====================================
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_notified ON user_achievements(user_id, is_notified);
CREATE INDEX idx_user_badges_user ON user_badges(user_id);
CREATE INDEX idx_user_action_counters_user ON user_action_counters(user_id);
CREATE INDEX idx_achievement_progress_user ON achievement_progress(user_id);

-- ====================================
-- 업적 시드 데이터 (74개)
-- ====================================

-- Category 1: FIRST_STEPS (첫 걸음) - 7개
INSERT INTO achievements (id, category, name_kr, name_en, description_kr, icon, is_hidden, is_tiered, tier_thresholds, grants_badge_at, badge_id, display_order) VALUES
('FIRST_LOGIN', 'FIRST_STEPS', '어서오세요!', 'Welcome', '첫 로그인을 했습니다', 'fa-door-open', FALSE, FALSE, NULL, NULL, NULL, 1),
('FIRST_EXAM', 'FIRST_STEPS', '시험 데뷔', 'Exam Debut', '첫 시험을 완료했습니다', 'fa-pen-to-square', FALSE, FALSE, NULL, NULL, NULL, 2),
('FIRST_PASS', 'FIRST_STEPS', '합격의 기쁨', 'First Victory', '첫 합격을 했습니다', 'fa-circle-check', FALSE, FALSE, NULL, NULL, NULL, 3),
('FIRST_PERFECT', 'FIRST_STEPS', '완벽한 시작', 'Flawless Start', '첫 만점을 받았습니다', 'fa-star', FALSE, FALSE, NULL, NULL, NULL, 4),
('FIRST_STUDY', 'FIRST_STEPS', '학습 시작', 'Study Begins', '학습 페이지를 처음 방문했습니다', 'fa-book-open', FALSE, FALSE, NULL, NULL, NULL, 5),
('FIRST_TTS', 'FIRST_STEPS', '따라 읽기', 'First Pronunciation', 'TTS 발음 듣기를 처음 사용했습니다', 'fa-volume-high', FALSE, FALSE, NULL, NULL, NULL, 6),
('FIRST_OFFLINE', 'FIRST_STEPS', '아날로그 감성', 'Analog Soul', '오프라인 시험을 처음 완료했습니다', 'fa-print', FALSE, FALSE, NULL, NULL, NULL, 7);

-- Category 2: EXAM_MASTER (시험 마스터) - 8개
INSERT INTO achievements (id, category, name_kr, name_en, description_kr, icon, is_hidden, is_tiered, tier_thresholds, grants_badge_at, badge_id, display_order) VALUES
('EXAM_COUNT', 'EXAM_MASTER', '시험의 달인', 'Exam Veteran', '시험을 N회 완료했습니다', 'fa-graduation-cap', FALSE, TRUE, '{"BRONZE":3,"SILVER":10,"GOLD":25,"DIAMOND":50}', 'GOLD', 'BADGE_EXAM_VETERAN', 10),
('PASS_COUNT', 'EXAM_MASTER', '합격 행진', 'Pass Parade', '시험을 N회 합격했습니다', 'fa-trophy', FALSE, TRUE, '{"BRONZE":3,"SILVER":10,"GOLD":25,"DIAMOND":50}', 'GOLD', 'BADGE_PASS_PARADE', 11),
('HIGH_SCORE', 'EXAM_MASTER', '고득점', 'High Scorer', '단일 시험에서 N점 이상 획득했습니다', 'fa-arrow-up-9-1', FALSE, TRUE, '{"BRONZE":20,"SILVER":25,"GOLD":28,"DIAMOND":30}', 'DIAMOND', 'BADGE_HIGH_SCORER', 12),
('AVG_SCORE', 'EXAM_MASTER', '꾸준한 실력', 'Consistent', '평균 점수가 N점 이상입니다 (최소 5회)', 'fa-chart-line', FALSE, TRUE, '{"BRONZE":18,"SILVER":22,"GOLD":25,"DIAMOND":28}', 'DIAMOND', 'BADGE_CONSISTENT', 13),
('ONLINE_MASTER', 'EXAM_MASTER', '온라인 장인', 'CBT Expert', '온라인 시험을 N회 완료했습니다', 'fa-desktop', FALSE, TRUE, '{"BRONZE":3,"SILVER":10,"GOLD":20,"DIAMOND":40}', NULL, NULL, 14),
('OFFLINE_MASTER', 'EXAM_MASTER', '오프라인 장인', 'Paper Expert', '오프라인 시험을 N회 완료했습니다', 'fa-file-image', FALSE, TRUE, '{"BRONZE":2,"SILVER":5,"GOLD":10,"DIAMOND":20}', 'GOLD', 'BADGE_PAPER_EXPERT', 15),
('BOTH_MODES', 'EXAM_MASTER', '만능 시험러', 'Versatile', '온라인과 오프라인 시험을 모두 완료했습니다', 'fa-arrows-left-right', FALSE, FALSE, NULL, NULL, NULL, 16),
('TOTAL_CORRECT', 'EXAM_MASTER', '정답의 산', 'Answer Mountain', '누적 정답 수가 N개입니다', 'fa-mountain', FALSE, TRUE, '{"BRONZE":50,"SILVER":200,"GOLD":500,"DIAMOND":1000}', 'DIAMOND', 'BADGE_ANSWER_MOUNTAIN', 17);

-- Category 3: PERFECTIONIST (완벽주의자) - 5개
INSERT INTO achievements (id, category, name_kr, name_en, description_kr, icon, is_hidden, is_tiered, tier_thresholds, grants_badge_at, badge_id, display_order) VALUES
('PERFECT_SCORE', 'PERFECTIONIST', '만점왕', 'Perfect Score', '만점을 N회 달성했습니다', 'fa-crown', FALSE, TRUE, '{"BRONZE":1,"SILVER":3,"GOLD":5,"DIAMOND":10}', 'DIAMOND', 'BADGE_PERFECT_KING', 20),
('PERFECT_STREAK', 'PERFECTIONIST', '연속 만점', 'Perfection Streak', '연속 N회 만점을 달성했습니다', 'fa-fire', FALSE, TRUE, '{"BRONZE":2,"SILVER":3,"GOLD":5,"DIAMOND":7}', 'GOLD', 'BADGE_PERFECT_STREAK', 21),
('PASS_STREAK', 'PERFECTIONIST', '연속 합격', 'Pass Streak', '연속 N회 합격했습니다', 'fa-link', FALSE, TRUE, '{"BRONZE":3,"SILVER":5,"GOLD":10,"DIAMOND":20}', 'GOLD', 'BADGE_PASS_STREAK', 22),
('SCORE_IMPROVEMENT', 'PERFECTIONIST', '성장하는 나', 'Growing', '이전 시험 대비 N점 이상 향상했습니다', 'fa-seedling', FALSE, TRUE, '{"BRONZE":3,"SILVER":5,"GOLD":8,"DIAMOND":10}', NULL, NULL, 23),
('NEVER_FAIL', 'PERFECTIONIST', '무패', 'Undefeated', '10회 이상 시험에서 한 번도 불합격하지 않았습니다', 'fa-shield-halved', FALSE, FALSE, NULL, 'SINGLE', 'BADGE_UNDEFEATED', 24);

-- Category 4: STUDY_KING (학습왕) - 8개
INSERT INTO achievements (id, category, name_kr, name_en, description_kr, icon, is_hidden, is_tiered, tier_thresholds, grants_badge_at, badge_id, display_order) VALUES
('VOCAB_COUNT', 'STUDY_KING', '단어 수집가', 'Word Collector', '단어를 N개 학습했습니다', 'fa-spell-check', FALSE, TRUE, '{"BRONZE":50,"SILVER":200,"GOLD":500,"DIAMOND":1000}', 'GOLD', 'BADGE_WORD_COLLECTOR', 30),
('TTS_COUNT', 'STUDY_KING', '원어민 연습', 'Pronunciation Pro', 'TTS 발음 듣기를 N회 사용했습니다', 'fa-microphone', FALSE, TRUE, '{"BRONZE":10,"SILVER":50,"GOLD":200,"DIAMOND":500}', 'GOLD', 'BADGE_PRONUNCIATION', 31),
('STUDY_VISIT', 'STUDY_KING', '학습 습관', 'Study Habit', '학습 페이지를 N회 방문했습니다', 'fa-book-open-reader', FALSE, TRUE, '{"BRONZE":5,"SILVER":20,"GOLD":50,"DIAMOND":100}', NULL, NULL, 32),
('VIDEO_WATCH', 'STUDY_KING', '영상 학습', 'Video Learner', '학습 영상을 N개 시청했습니다', 'fa-video', FALSE, TRUE, '{"BRONZE":3,"SILVER":10,"GOLD":30,"DIAMOND":50}', NULL, NULL, 33),
('PDF_DOWNLOAD', 'STUDY_KING', '자료 활용', 'Resource User', '학습 자료를 N회 다운로드했습니다', 'fa-file-pdf', FALSE, TRUE, '{"BRONZE":3,"SILVER":10,"GOLD":25,"DIAMOND":50}', NULL, NULL, 34),
('VOCAB_DOWNLOAD', 'STUDY_KING', '단어장 저장', 'Vocabulary Saver', '단어장 엑셀을 N회 다운로드했습니다', 'fa-file-excel', FALSE, TRUE, '{"BRONZE":1,"SILVER":5,"GOLD":10,"DIAMOND":25}', NULL, NULL, 35),
('ALL_MATERIALS', 'STUDY_KING', '완전 학습', 'Complete Study', '한 회차의 모든 학습자료를 활용했습니다', 'fa-check-double', FALSE, FALSE, NULL, NULL, NULL, 36),
('STUDY_ROUNDS', 'STUDY_KING', '다회차 학습', 'Multi-Round Study', 'N개 회차의 학습자료를 열람했습니다', 'fa-layer-group', FALSE, TRUE, '{"BRONZE":3,"SILVER":10,"GOLD":20,"DIAMOND":40}', NULL, NULL, 37);

-- Category 5: STREAKS (연속 기록) - 6개
INSERT INTO achievements (id, category, name_kr, name_en, description_kr, icon, is_hidden, is_tiered, tier_thresholds, grants_badge_at, badge_id, display_order) VALUES
('LOGIN_STREAK', 'STREAKS', '꾸준한 출석', 'Attendance King', 'N일 연속 로그인했습니다', 'fa-calendar-check', FALSE, TRUE, '{"BRONZE":3,"SILVER":7,"GOLD":14,"DIAMOND":30}', 'DIAMOND', 'BADGE_ATTENDANCE', 40),
('EXAM_STREAK', 'STREAKS', '시험 연속', 'Exam Streak', 'N일 연속 시험을 완료했습니다', 'fa-bolt', FALSE, TRUE, '{"BRONZE":3,"SILVER":5,"GOLD":7,"DIAMOND":14}', 'GOLD', 'BADGE_EXAM_STREAK', 41),
('DAILY_EXAM', 'STREAKS', '하루 다시험', 'Daily Warrior', '하루에 시험을 N회 완료했습니다', 'fa-forward-fast', FALSE, TRUE, '{"BRONZE":2,"SILVER":3}', NULL, NULL, 42),
('WEEKLY_ACTIVE', 'STREAKS', '주간 활동왕', 'Weekly Active', '한 주에 N일 이상 활동했습니다', 'fa-calendar-week', FALSE, TRUE, '{"BRONZE":3,"SILVER":5,"GOLD":7}', NULL, NULL, 43),
('MONTHLY_LOGIN', 'STREAKS', '월간 출석', 'Monthly Regular', '한 달에 N일 이상 로그인했습니다', 'fa-calendar-days', FALSE, TRUE, '{"BRONZE":10,"SILVER":15,"GOLD":20,"DIAMOND":25}', 'GOLD', 'BADGE_MONTHLY', 44),
('STUDY_STREAK', 'STREAKS', '학습 연속', 'Study Streak', 'N일 연속 학습했습니다', 'fa-fire-flame-curved', FALSE, TRUE, '{"BRONZE":3,"SILVER":7,"GOLD":14,"DIAMOND":30}', 'DIAMOND', 'BADGE_STUDY_STREAK', 45);

-- Category 6: SPEED (스피드) - 5개
INSERT INTO achievements (id, category, name_kr, name_en, description_kr, icon, is_hidden, is_tiered, tier_thresholds, grants_badge_at, badge_id, display_order) VALUES
('FAST_EXAM', 'SPEED', '스피드 시험', 'Speed Demon', '시험을 N분 이내에 완료했습니다', 'fa-gauge-high', FALSE, TRUE, '{"BRONZE":30,"SILVER":20,"GOLD":10,"DIAMOND":5}', 'GOLD', 'BADGE_SPEED_DEMON', 50),
('FIRST_SUBMIT', 'SPEED', '1등 제출', 'First to Submit', '회차에서 가장 먼저 시험을 제출했습니다', 'fa-flag-checkered', FALSE, FALSE, NULL, NULL, NULL, 51),
('FIRST_SUBMIT_COUNT', 'SPEED', '빠른 손', 'Quick Hands', 'N회차에서 가장 먼저 시험을 제출했습니다', 'fa-hand', FALSE, TRUE, '{"BRONZE":1,"SILVER":3,"GOLD":5,"DIAMOND":10}', 'GOLD', 'BADGE_QUICK_HANDS', 52),
('SPEED_PASS', 'SPEED', '번개 합격', 'Lightning Pass', 'N분 이내에 합격했습니다', 'fa-bolt-lightning', FALSE, TRUE, '{"BRONZE":20,"SILVER":15,"GOLD":10,"DIAMOND":5}', 'DIAMOND', 'BADGE_LIGHTNING', 53),
('SLOW_AND_STEADY', 'SPEED', '느긋한 합격', 'Slow & Steady', '30분 이상 소요했지만 합격했습니다', 'fa-turtle', FALSE, FALSE, NULL, NULL, NULL, 54);

-- Category 7: COMPETITION (경쟁) - 7개
INSERT INTO achievements (id, category, name_kr, name_en, description_kr, icon, is_hidden, is_tiered, tier_thresholds, grants_badge_at, badge_id, display_order) VALUES
('RANK_FIRST', 'COMPETITION', '1등!', 'Champion', '회차 랭킹 1위를 달성했습니다', 'fa-medal', FALSE, FALSE, NULL, NULL, NULL, 60),
('RANK_FIRST_COUNT', 'COMPETITION', '상위 1%', 'Top Dog', '누적 N회 1위를 달성했습니다', 'fa-ranking-star', FALSE, TRUE, '{"BRONZE":1,"SILVER":3,"GOLD":5,"DIAMOND":10}', 'DIAMOND', 'BADGE_CHAMPION', 61),
('RANK_TOP2', 'COMPETITION', '항상 위에', 'Podium Regular', '2등 이내를 N회 달성했습니다', 'fa-podium', FALSE, TRUE, '{"BRONZE":3,"SILVER":5,"GOLD":10,"DIAMOND":20}', 'GOLD', 'BADGE_PODIUM', 62),
('BEAT_EVERYONE', 'COMPETITION', '전원 격파', 'Beat Everyone', '4명 모두 참여한 회차에서 1위를 달성했습니다', 'fa-users-slash', FALSE, FALSE, NULL, NULL, NULL, 63),
('COMEBACK', 'COMPETITION', '역전승', 'Comeback King', '이전 회차 꼴찌에서 다음 회차 1등을 달성했습니다', 'fa-rotate-right', FALSE, FALSE, NULL, 'SINGLE', 'BADGE_COMEBACK', 64),
('RIVAL_WIN', 'COMPETITION', '라이벌 승리', 'Rivalry', '특정 사용자보다 높은 점수를 N회 달성했습니다', 'fa-handshake-slash', FALSE, TRUE, '{"BRONZE":3,"SILVER":5,"GOLD":10}', NULL, NULL, 65),
('FULL_PARTICIPATION', 'COMPETITION', '개근왕', 'Always There', 'N회차에 참여했습니다', 'fa-clipboard-check', FALSE, TRUE, '{"BRONZE":5,"SILVER":10,"GOLD":20,"DIAMOND":40}', 'GOLD', 'BADGE_ALWAYS_THERE', 66);

-- Category 8: EXPLORER (탐험가) - 5개
INSERT INTO achievements (id, category, name_kr, name_en, description_kr, icon, is_hidden, is_tiered, tier_thresholds, grants_badge_at, badge_id, display_order) VALUES
('FEATURE_EXPLORER', 'EXPLORER', '기능 탐험가', 'Feature Explorer', '모든 주요 기능을 사용해봤습니다', 'fa-compass', FALSE, FALSE, NULL, NULL, NULL, 70),
('ROUND_EXPLORER', 'EXPLORER', '회차 탐험가', 'Round Explorer', 'N개 회차의 시험을 응시했습니다', 'fa-map', FALSE, TRUE, '{"BRONZE":3,"SILVER":10,"GOLD":20,"DIAMOND":40}', NULL, NULL, 71),
('NIGHT_OWL', 'EXPLORER', '야행성', 'Night Owl', '밤 10시 이후에 시험을 완료했습니다', 'fa-moon', FALSE, FALSE, NULL, NULL, NULL, 72),
('EARLY_BIRD', 'EXPLORER', '아침형 인간', 'Early Bird', '오전 7시 이전에 시험을 완료했습니다', 'fa-sun', FALSE, FALSE, NULL, NULL, NULL, 73),
('WEEKEND_WARRIOR', 'EXPLORER', '주말 전사', 'Weekend Warrior', '주말에 시험을 N회 완료했습니다', 'fa-umbrella-beach', FALSE, TRUE, '{"BRONZE":1,"SILVER":5,"GOLD":10,"DIAMOND":20}', NULL, NULL, 74);

-- Category 9: PROGRESS_MASTER (진도 마스터) - 8개
INSERT INTO achievements (id, category, name_kr, name_en, description_kr, icon, is_hidden, is_tiered, tier_thresholds, grants_badge_at, badge_id, display_order) VALUES
('BOOK1_PROGRESS', 'PROGRESS_MASTER', '1분영어 마스터', '1-Min English', 'Book 1 진도를 N% 완료했습니다', 'fa-book', FALSE, TRUE, '{"BRONZE":25,"SILVER":50,"GOLD":75,"DIAMOND":100}', 'DIAMOND', 'BADGE_BOOK1', 80),
('BOOK2_PROGRESS', 'PROGRESS_MASTER', '프리토킹 마스터', 'Free Talking', 'Book 2 진도를 N% 완료했습니다', 'fa-comments', FALSE, TRUE, '{"BRONZE":25,"SILVER":50,"GOLD":75,"DIAMOND":100}', 'DIAMOND', 'BADGE_BOOK2', 81),
('BOTH_BOOKS', 'PROGRESS_MASTER', '이중 교재', 'Dual Textbook', '두 교재 모두 N% 이상 진행했습니다', 'fa-book-bookmark', FALSE, TRUE, '{"BRONZE":10,"SILVER":25,"GOLD":50,"DIAMOND":75}', 'GOLD', 'BADGE_DUAL_BOOK', 82),
('CHAPTER_STREAK', 'PROGRESS_MASTER', '진도 연속', 'Chapter Streak', '연속 N챕터를 완료했습니다', 'fa-forward-step', FALSE, TRUE, '{"BRONZE":3,"SILVER":5,"GOLD":10,"DIAMOND":20}', NULL, NULL, 83),
('PART_COMPLETE', 'PROGRESS_MASTER', '파트 정복', 'Part Complete', '한 파트를 전체 완료했습니다', 'fa-flag', FALSE, FALSE, NULL, NULL, NULL, 84),
('PART_COUNT', 'PROGRESS_MASTER', '파트 수집가', 'Part Collector', 'N개 파트를 전체 완료했습니다', 'fa-boxes-stacked', FALSE, TRUE, '{"BRONZE":1,"SILVER":3,"GOLD":5,"DIAMOND":10}', 'GOLD', 'BADGE_PART_COLLECTOR', 85),
('BOOK1_COMPLETE', 'PROGRESS_MASTER', '1분영어 졸업', 'Book 1 Graduate', 'Book 1을 전체 완료했습니다 (83 Units)', 'fa-user-graduate', FALSE, FALSE, NULL, 'SINGLE', 'BADGE_BOOK1_GRAD', 86),
('BOOK2_COMPLETE', 'PROGRESS_MASTER', '프리토킹 졸업', 'Book 2 Graduate', 'Book 2를 전체 완료했습니다 (100 Days)', 'fa-user-graduate', FALSE, FALSE, NULL, 'SINGLE', 'BADGE_BOOK2_GRAD', 87);

-- Category 10: HIDDEN (숨겨진 업적) - 8개
INSERT INTO achievements (id, category, name_kr, name_en, description_kr, icon, is_hidden, is_tiered, tier_thresholds, grants_badge_at, badge_id, display_order) VALUES
('EXACTLY_HALF', 'HIDDEN', '딱 반', 'Exactly Half', '정확히 절반만 맞았습니다', 'fa-scale-balanced', TRUE, FALSE, NULL, NULL, NULL, 90),
('SCORE_PALINDROME', 'HIDDEN', '회문 점수', 'Palindrome Score', '점수가 회문입니다 (11, 22 등)', 'fa-repeat', TRUE, FALSE, NULL, NULL, NULL, 91),
('LAST_SECOND', 'HIDDEN', '막판 스퍼트', 'Last Second', '뒤쪽 5문제 중 4개 이상 정답 (앞쪽 50% 미만일 때)', 'fa-rocket', TRUE, FALSE, NULL, NULL, NULL, 92),
('ZERO_HERO', 'HIDDEN', '영점 영웅', 'Zero Hero', '0점을 받았습니다... 하지만 시도 자체가 용기!', 'fa-face-smile-wink', TRUE, FALSE, NULL, NULL, NULL, 93),
('FOUR_COMPLETE', 'HIDDEN', '사인사색', 'Four Colors', '4명 모두 완료한 회차에 참여했습니다', 'fa-people-group', TRUE, FALSE, NULL, NULL, NULL, 94),
('MIDNIGHT_EXAM', 'HIDDEN', '자정의 도전', 'Midnight Challenge', '자정(00:00~00:59) 사이에 시험을 제출했습니다', 'fa-clock', TRUE, FALSE, NULL, NULL, NULL, 95),
('SAME_SCORE', 'HIDDEN', '동점자', 'Score Twin', '같은 회차에서 다른 사용자와 동점입니다', 'fa-equals', TRUE, FALSE, NULL, NULL, NULL, 96),
('TRIPLE_EXAM_DAY', 'HIDDEN', '삼시세끼 시험', 'Triple Exam Day', '하루에 3회 시험을 완료했습니다', 'fa-utensils', TRUE, FALSE, NULL, NULL, NULL, 97);

-- Category 11: LEGEND (레전드) - 6개
INSERT INTO achievements (id, category, name_kr, name_en, description_kr, icon, is_hidden, is_tiered, tier_thresholds, grants_badge_at, badge_id, display_order) VALUES
('LEGEND_SCHOLAR', 'LEGEND', '만학도', 'The Scholar', '전체 시험 평균 27점 이상 (최소 20회)', 'fa-hat-wizard', FALSE, FALSE, NULL, 'SINGLE', 'BADGE_LEGEND_SCHOLAR', 100),
('LEGEND_MARATHON', 'LEGEND', '마라톤 러너', 'Marathon Runner', '100회 시험을 완료했습니다', 'fa-person-running', FALSE, FALSE, NULL, 'SINGLE', 'BADGE_LEGEND_MARATHON', 101),
('LEGEND_COMPLETE', 'LEGEND', '올클리어', 'All Clear', '두 교재를 모두 100% 완료했습니다', 'fa-gem', FALSE, FALSE, NULL, 'SINGLE', 'BADGE_LEGEND_COMPLETE', 102),
('LEGEND_PERFECT_10', 'LEGEND', '십전십미', 'Perfection 10', '만점을 10회 달성했습니다', 'fa-diamond', FALSE, FALSE, NULL, 'SINGLE', 'BADGE_LEGEND_PERFECT', 103),
('LEGEND_STREAK_30', 'LEGEND', '30일 연속', '30-Day Warrior', '30일 연속 로그인했습니다', 'fa-fire-flame-simple', FALSE, FALSE, NULL, 'SINGLE', 'BADGE_LEGEND_STREAK', 104),
('LEGEND_GRANDMASTER', 'LEGEND', '그랜드마스터', 'Grandmaster', 'Gold 이상 업적을 20개 이상 달성했습니다', 'fa-chess-king', FALSE, FALSE, NULL, 'SINGLE', 'BADGE_LEGEND_GRANDMASTER', 105);

-- ====================================
-- 뱃지 시드 데이터 (18개)
-- ====================================
INSERT INTO badges (id, achievement_id, name_kr, name_en, description_kr, icon, rarity, profile_effect) VALUES
('BADGE_EXAM_VETERAN', 'EXAM_COUNT', '시험의 달인', 'Exam Veteran', '시험 25회 이상 완료', 'fa-graduation-cap', 'RARE', 'effect-rare'),
('BADGE_PASS_PARADE', 'PASS_COUNT', '합격 행진', 'Pass Parade', '시험 25회 이상 합격', 'fa-trophy', 'RARE', 'effect-rare'),
('BADGE_HIGH_SCORER', 'HIGH_SCORE', '고득점 마스터', 'High Scorer', '만점 달성', 'fa-arrow-up-9-1', 'EPIC', 'effect-epic'),
('BADGE_CONSISTENT', 'AVG_SCORE', '꾸준한 실력', 'Consistent', '평균 28점 이상', 'fa-chart-line', 'EPIC', 'effect-epic'),
('BADGE_PAPER_EXPERT', 'OFFLINE_MASTER', '오프라인 장인', 'Paper Expert', '오프라인 시험 10회 이상', 'fa-file-image', 'RARE', 'effect-rare'),
('BADGE_ANSWER_MOUNTAIN', 'TOTAL_CORRECT', '정답의 산', 'Answer Mountain', '누적 정답 1000개', 'fa-mountain', 'EPIC', 'effect-epic'),
('BADGE_PERFECT_KING', 'PERFECT_SCORE', '만점왕', 'Perfect King', '만점 10회 달성', 'fa-crown', 'EPIC', 'effect-epic'),
('BADGE_PERFECT_STREAK', 'PERFECT_STREAK', '연속 만점', 'Perfect Streak', '연속 5회 만점', 'fa-fire', 'EPIC', 'effect-epic'),
('BADGE_PASS_STREAK', 'PASS_STREAK', '연속 합격', 'Pass Streak', '연속 10회 합격', 'fa-link', 'RARE', 'effect-rare'),
('BADGE_UNDEFEATED', 'NEVER_FAIL', '무패', 'Undefeated', '10회 이상 중 불합격 0', 'fa-shield-halved', 'EPIC', 'effect-epic'),
('BADGE_WORD_COLLECTOR', 'VOCAB_COUNT', '단어 수집가', 'Word Collector', '단어 500개 이상 학습', 'fa-spell-check', 'RARE', 'effect-rare'),
('BADGE_PRONUNCIATION', 'TTS_COUNT', '발음왕', 'Pronunciation Pro', 'TTS 200회 이상', 'fa-microphone', 'RARE', 'effect-rare'),
('BADGE_ATTENDANCE', 'LOGIN_STREAK', '출석왕', 'Attendance King', '30일 연속 로그인', 'fa-calendar-check', 'EPIC', 'effect-epic'),
('BADGE_STUDY_STREAK', 'STUDY_STREAK', '학습왕', 'Study Streak', '30일 연속 학습', 'fa-fire-flame-curved', 'EPIC', 'effect-epic'),
('BADGE_SPEED_DEMON', 'FAST_EXAM', '스피드왕', 'Speed Demon', '10분 이내 시험 완료', 'fa-gauge-high', 'RARE', 'effect-rare'),
('BADGE_QUICK_HANDS', 'FIRST_SUBMIT_COUNT', '빠른 손', 'Quick Hands', '5회 최초 제출', 'fa-hand', 'RARE', 'effect-rare'),
('BADGE_LIGHTNING', 'SPEED_PASS', '번개 합격', 'Lightning Pass', '5분 이내 합격', 'fa-bolt-lightning', 'EPIC', 'effect-epic'),
('BADGE_CHAMPION', 'RANK_FIRST_COUNT', '챔피언', 'Champion', '10회 1위 달성', 'fa-ranking-star', 'EPIC', 'effect-epic'),
('BADGE_PODIUM', 'RANK_TOP2', '항상 위에', 'Podium Regular', '10회 2등 이내', 'fa-medal', 'RARE', 'effect-rare'),
('BADGE_COMEBACK', 'COMEBACK', '역전승', 'Comeback King', '꼴찌에서 1등 달성', 'fa-rotate-right', 'EPIC', 'effect-epic'),
('BADGE_ALWAYS_THERE', 'FULL_PARTICIPATION', '개근왕', 'Always There', '20회차 참여', 'fa-clipboard-check', 'RARE', 'effect-rare'),
('BADGE_BOOK1', 'BOOK1_PROGRESS', '1분영어 마스터', '1-Min English Master', 'Book 1 100% 완료', 'fa-book', 'EPIC', 'effect-epic'),
('BADGE_BOOK2', 'BOOK2_PROGRESS', '프리토킹 마스터', 'Free Talking Master', 'Book 2 100% 완료', 'fa-comments', 'EPIC', 'effect-epic'),
('BADGE_DUAL_BOOK', 'BOTH_BOOKS', '이중 교재', 'Dual Textbook', '양쪽 교재 50% 이상', 'fa-book-bookmark', 'RARE', 'effect-rare'),
('BADGE_PART_COLLECTOR', 'PART_COUNT', '파트 수집가', 'Part Collector', '5개 파트 완료', 'fa-boxes-stacked', 'RARE', 'effect-rare'),
('BADGE_BOOK1_GRAD', 'BOOK1_COMPLETE', '1분영어 졸업', 'Book 1 Graduate', 'Book 1 전체 완료', 'fa-user-graduate', 'EPIC', 'effect-epic'),
('BADGE_BOOK2_GRAD', 'BOOK2_COMPLETE', '프리토킹 졸업', 'Book 2 Graduate', 'Book 2 전체 완료', 'fa-user-graduate', 'EPIC', 'effect-epic'),
('BADGE_MONTHLY', 'MONTHLY_LOGIN', '월간 출석', 'Monthly Regular', '월 20일 이상 로그인', 'fa-calendar-days', 'RARE', 'effect-rare'),
('BADGE_EXAM_STREAK', 'EXAM_STREAK', '시험 연속', 'Exam Streak', '7일 연속 시험', 'fa-bolt', 'RARE', 'effect-rare'),
('BADGE_LEGEND_SCHOLAR', 'LEGEND_SCHOLAR', '만학도', 'The Scholar', '평균 27점 이상, 20회 이상', 'fa-hat-wizard', 'LEGENDARY', 'effect-legendary'),
('BADGE_LEGEND_MARATHON', 'LEGEND_MARATHON', '마라톤 러너', 'Marathon Runner', '100회 시험 완료', 'fa-person-running', 'LEGENDARY', 'effect-legendary'),
('BADGE_LEGEND_COMPLETE', 'LEGEND_COMPLETE', '올클리어', 'All Clear', '양 교재 100%', 'fa-gem', 'LEGENDARY', 'effect-legendary'),
('BADGE_LEGEND_PERFECT', 'LEGEND_PERFECT_10', '십전십미', 'Perfection 10', '만점 10회', 'fa-diamond', 'LEGENDARY', 'effect-legendary'),
('BADGE_LEGEND_STREAK', 'LEGEND_STREAK_30', '30일 연속', '30-Day Warrior', '30일 연속 로그인', 'fa-fire-flame-simple', 'LEGENDARY', 'effect-legendary'),
('BADGE_LEGEND_GRANDMASTER', 'LEGEND_GRANDMASTER', '그랜드마스터', 'Grandmaster', 'Gold 이상 업적 20개', 'fa-chess-king', 'LEGENDARY', 'effect-legendary');
