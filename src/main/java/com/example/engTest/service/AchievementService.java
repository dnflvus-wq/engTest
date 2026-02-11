package com.example.engTest.service;

import com.example.engTest.dto.Achievement;
import com.example.engTest.dto.AchievementProgress;
import com.example.engTest.dto.UserAchievement;
import com.example.engTest.mapper.AchievementMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AchievementService {

    private final AchievementMapper achievementMapper;
    private final AchievementCheckService checkService;
    private final BadgeService badgeService;
    private final ObjectMapper objectMapper;

    // 이벤트별 체크할 업적 카테고리 매핑
    private static final Map<String, Set<String>> EVENT_CATEGORIES = Map.of(
            "EXAM_COMPLETE", Set.of("FIRST_STEPS", "EXAM_MASTER", "PERFECTIONIST", "SPEED", "COMPETITION", "EXPLORER", "PROGRESS_MASTER", "HIDDEN", "LEGEND"),
            "LOGIN", Set.of("FIRST_STEPS", "STREAKS", "LEGEND"),
            "STUDY_ACTION", Set.of("FIRST_STEPS", "STUDY_KING", "STREAKS", "EXPLORER"),
            "ALL", Set.of("FIRST_STEPS", "EXAM_MASTER", "PERFECTIONIST", "STUDY_KING", "STREAKS", "SPEED", "COMPETITION", "EXPLORER", "PROGRESS_MASTER", "HIDDEN", "LEGEND")
    );

    /**
     * 비동기로 업적 체크 실행
     * ExamService.submitExam(), UserController.login() 등에서 호출
     */
    @Async
    public void checkAchievements(Long userId, String triggerEvent) {
        try {
            log.info("Checking achievements: userId={}, event={}", userId, triggerEvent);
            Set<String> categories = EVENT_CATEGORIES.getOrDefault(triggerEvent, EVENT_CATEGORIES.get("ALL"));

            List<Achievement> allAchievements = achievementMapper.findAll();
            List<UserAchievement> existing = achievementMapper.findUserAchievements(userId);

            // 기존 달성 현황 맵 (achievementId -> 최고 티어)
            Map<String, String> existingTiers = new HashMap<>();
            for (UserAchievement ua : existing) {
                String current = existingTiers.get(ua.getAchievementId());
                if (current == null || compareTier(ua.getTier(), current) > 0) {
                    existingTiers.put(ua.getAchievementId(), ua.getTier());
                }
            }

            for (Achievement achievement : allAchievements) {
                if (!categories.contains(achievement.getCategory())) continue;

                String currentTier = existingTiers.get(achievement.getId());
                AchievementCheckService.CheckResult result = checkService.check(
                        userId, achievement.getId(), achievement.getTierThresholds(), currentTier);

                // 진행도 업데이트
                updateProgress(userId, achievement, result.currentValue());

                // 새로 달성한 경우
                if (result.changed()) {
                    unlockAchievement(userId, achievement, result.highestNewTier(), result.currentValue());
                }
            }
        } catch (Exception e) {
            log.error("Achievement check failed: userId={}, event={}", userId, triggerEvent, e);
        }
    }

    @Transactional
    void unlockAchievement(Long userId, Achievement achievement, String tier, int value) {
        // 중복 체크
        UserAchievement existing = achievementMapper.findUserAchievement(userId, achievement.getId(), tier);
        if (existing != null) return;

        // 티어 업적인 경우, 중간 티어도 모두 기록
        if (achievement.getIsTiered() != null && achievement.getIsTiered() && tier != null) {
            String[] tierOrder = {"BRONZE", "SILVER", "GOLD", "DIAMOND"};
            int targetIdx = indexOf(tierOrder, tier);
            for (int i = 0; i <= targetIdx; i++) {
                UserAchievement check = achievementMapper.findUserAchievement(userId, achievement.getId(), tierOrder[i]);
                if (check == null) {
                    UserAchievement ua = UserAchievement.builder()
                            .userId(userId)
                            .achievementId(achievement.getId())
                            .tier(tierOrder[i])
                            .currentValue(value)
                            .build();
                    achievementMapper.insertUserAchievement(ua);
                    log.info("Achievement unlocked: userId={}, achievement={}, tier={}", userId, achievement.getId(), tierOrder[i]);
                }
            }
        } else {
            // 비티어 업적
            UserAchievement ua = UserAchievement.builder()
                    .userId(userId)
                    .achievementId(achievement.getId())
                    .tier(null)
                    .currentValue(value)
                    .build();
            achievementMapper.insertUserAchievement(ua);
            log.info("Achievement unlocked: userId={}, achievement={}", userId, achievement.getId());
        }

        // 뱃지 수여 체크
        if (achievement.getBadgeId() != null && achievement.getGrantsBadgeAt() != null) {
            String grantAt = achievement.getGrantsBadgeAt();
            if ("SINGLE".equals(grantAt) || grantAt.equals(tier)) {
                badgeService.awardBadge(userId, achievement.getBadgeId());
            }
            // Gold+인 경우 GOLD, DIAMOND 모두 해당
            if ("GOLD".equals(grantAt) && ("GOLD".equals(tier) || "DIAMOND".equals(tier))) {
                badgeService.awardBadge(userId, achievement.getBadgeId());
            }
        }
    }

    private void updateProgress(Long userId, Achievement achievement, int currentValue) {
        if (achievement.getIsTiered() == null || !achievement.getIsTiered()) return;

        Map<String, Integer> thresholds = parseThresholds(achievement.getTierThresholds());
        if (thresholds == null) return;

        // 다음 티어 찾기
        String[] tierOrder = {"BRONZE", "SILVER", "GOLD", "DIAMOND"};
        String nextTier = null;
        int targetValue = 0;

        for (String t : tierOrder) {
            Integer threshold = thresholds.get(t);
            if (threshold != null && currentValue < threshold) {
                nextTier = t;
                targetValue = threshold;
                break;
            }
        }

        if (nextTier == null) {
            // 모든 티어 달성
            targetValue = thresholds.getOrDefault("DIAMOND", 0);
            nextTier = "COMPLETE";
        }

        AchievementProgress progress = AchievementProgress.builder()
                .userId(userId)
                .achievementId(achievement.getId())
                .currentValue(currentValue)
                .targetValue(targetValue)
                .nextTier(nextTier)
                .build();
        achievementMapper.upsertProgress(progress);
    }

    // === 공개 API 메서드들 ===

    public List<Achievement> getUserAchievements(Long userId) {
        return achievementMapper.findAllWithProgress(userId);
    }

    public List<UserAchievement> getUnnotifiedAchievements(Long userId) {
        return achievementMapper.findUnnotified(userId);
    }

    @Transactional
    public void markAsNotified(Long userId, List<Long> ids) {
        if (ids != null && !ids.isEmpty()) {
            achievementMapper.markAsNotified(userId, ids);
        }
    }

    public Map<String, Object> getSummary(Long userId) {
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalAchievements", 74);
        summary.put("unlockedCount", achievementMapper.countUnlockedByUser(userId));
        summary.put("badgeCount", badgeService.countUserBadges(userId));
        summary.put("goldOrAbove", achievementMapper.countGoldOrAboveByUser(userId));
        return summary;
    }

    // === 헬퍼 ===

    private int compareTier(String a, String b) {
        String[] order = {"BRONZE", "SILVER", "GOLD", "DIAMOND"};
        return indexOf(order, a) - indexOf(order, b);
    }

    private int indexOf(String[] arr, String value) {
        if (value == null) return -1;
        for (int i = 0; i < arr.length; i++) {
            if (arr[i].equals(value)) return i;
        }
        return -1;
    }

    private Map<String, Integer> parseThresholds(String json) {
        if (json == null || json.isBlank()) return null;
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            return null;
        }
    }
}
