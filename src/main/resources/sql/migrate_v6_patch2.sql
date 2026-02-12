-- migrate_v6_patch2.sql
-- WIN_STREAK 업적 + 뱃지 추가
-- LAST_SECOND 설명 수정 (구현에 맞게)

-- 1. WIN_STREAK 업적 추가
INSERT IGNORE INTO achievements (id, category, name_kr, name_en, description_kr, icon, is_hidden, is_tiered, tier_thresholds, badge_id, grants_badge_at, display_order)
VALUES ('WIN_STREAK', 'COMPETITION', '연승왕', 'Win Streak', '연속 N회 1등 달성', 'fa-crown', FALSE, TRUE,
        '{"BRONZE":3,"SILVER":5,"GOLD":7,"DIAMOND":10}', 'WIN_STREAK', 'BRONZE', 605);

-- 2. WIN_STREAK 뱃지 추가
INSERT IGNORE INTO badges (id, achievement_id, name_kr, name_en, description_kr, icon, rarity)
VALUES ('WIN_STREAK', 'WIN_STREAK', '연승왕', 'Win Streak', '연속 1등 달성', 'fa-crown', 'LEGENDARY');

-- 3. LAST_SECOND 설명 수정 (구현: 마지막 문제 정답)
UPDATE achievements SET description_kr = '마지막 문제를 맞혔습니다' WHERE id = 'LAST_SECOND';

-- 확인
SELECT id, name_kr FROM achievements WHERE id IN ('WIN_STREAK', 'LAST_SECOND');
SELECT id, name_kr FROM badges WHERE id = 'WIN_STREAK';
