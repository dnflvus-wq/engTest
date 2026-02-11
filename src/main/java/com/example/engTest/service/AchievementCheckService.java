package com.example.engTest.service;

import com.example.engTest.mapper.AchievementMapper;
import com.example.engTest.mapper.UserActionCounterMapper;
import com.example.engTest.mapper.BookChapterMapper;
import com.example.engTest.utils.TierUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AchievementCheckService {

    private final AchievementMapper achievementMapper;
    private final UserActionCounterMapper counterMapper;
    private final BookChapterMapper bookChapterMapper;
    private final ObjectMapper objectMapper;

    /**
     * 업적 체크 결과
     */
    public record CheckResult(int currentValue, String highestNewTier, boolean changed) {
        public static CheckResult unchanged(int value) {
            return new CheckResult(value, null, false);
        }
        public static CheckResult unlocked(int value, String tier) {
            return new CheckResult(value, tier, true);
        }
    }

    /**
     * 특정 업적에 대해 사용자의 달성 상태를 체크
     */
    public CheckResult check(Long userId, String achievementId, String tierThresholds, String currentTier) {
        try {
            return switch (achievementId) {
                // 첫 걸음
                case "FIRST_LOGIN" -> checkSimple(achievementMapper.countCompletedExams(userId) >= 0 ? 1 : 0, 1, currentTier);
                case "FIRST_EXAM" -> checkSimple(achievementMapper.countCompletedExams(userId), 1, currentTier);
                case "FIRST_PASS" -> checkSimple(achievementMapper.countPassedExams(userId), 1, currentTier);
                case "FIRST_PERFECT" -> checkSimple(achievementMapper.countPerfectScores(userId), 1, currentTier);
                case "FIRST_OFFLINE" -> checkSimple(achievementMapper.countOfflineExams(userId), 1, currentTier);
                case "FIRST_STUDY" -> checkSimple(counterMapper.getCount(userId, "STUDY_PAGE_VISIT"), 1, currentTier);
                case "FIRST_TTS" -> checkSimple(counterMapper.getCount(userId, "TTS_CLICK"), 1, currentTier);

                // 시험 마스터
                case "EXAM_COUNT" -> checkTiered(achievementMapper.countCompletedExams(userId), tierThresholds, currentTier);
                case "PASS_COUNT" -> checkTiered(achievementMapper.countPassedExams(userId), tierThresholds, currentTier);
                case "HIGH_SCORE" -> checkTiered(Optional.ofNullable(achievementMapper.getMaxCorrectCount(userId)).orElse(0), tierThresholds, currentTier);
                case "AVG_SCORE" -> {
                    Double avg = achievementMapper.getAvgScore(userId, 5);
                    yield checkTiered(avg != null ? avg.intValue() : 0, tierThresholds, currentTier);
                }
                case "ONLINE_MASTER" -> checkTiered(achievementMapper.countOnlineExams(userId), tierThresholds, currentTier);
                case "OFFLINE_MASTER" -> checkTiered(achievementMapper.countOfflineExams(userId), tierThresholds, currentTier);
                case "BOTH_MODES" -> checkSimple(
                        (achievementMapper.countOnlineExams(userId) > 0 && achievementMapper.countOfflineExams(userId) > 0) ? 1 : 0, 1, currentTier);
                case "TOTAL_CORRECT" -> checkTiered(achievementMapper.countTotalCorrect(userId), tierThresholds, currentTier);

                // 완벽주의자
                case "PERFECT_SCORE" -> checkTiered(achievementMapper.countPerfectScores(userId), tierThresholds, currentTier);
                case "PERFECT_STREAK" -> checkTiered(calcPerfectStreak(userId), tierThresholds, currentTier);
                case "PASS_STREAK" -> checkTiered(calcPassStreak(userId), tierThresholds, currentTier);
                case "SCORE_IMPROVEMENT" -> checkTiered(calcScoreImprovement(userId), tierThresholds, currentTier);
                case "NEVER_FAIL" -> {
                    int total = achievementMapper.countCompletedExams(userId);
                    int passed = achievementMapper.countPassedExams(userId);
                    yield checkSimple((total >= 10 && total == passed) ? 1 : 0, 1, currentTier);
                }

                // 학습왕
                case "VOCAB_COUNT" -> {
                    int count = bookChapterMapper.getTotalVocabularyCountByUserId(userId);
                    yield checkTiered(count, tierThresholds, currentTier);
                }
                case "TTS_COUNT" -> checkTiered(counterMapper.getCount(userId, "TTS_CLICK"), tierThresholds, currentTier);
                case "STUDY_VISIT" -> checkTiered(counterMapper.getCount(userId, "STUDY_PAGE_VISIT"), tierThresholds, currentTier);
                case "VIDEO_WATCH" -> checkTiered(counterMapper.getCount(userId, "VIDEO_PLAY"), tierThresholds, currentTier);
                case "PDF_DOWNLOAD" -> checkTiered(counterMapper.getCount(userId, "PDF_DOWNLOAD"), tierThresholds, currentTier);
                case "VOCAB_DOWNLOAD" -> checkTiered(counterMapper.getCount(userId, "VOCAB_DOWNLOAD"), tierThresholds, currentTier);
                case "ALL_MATERIALS" -> checkSimple(counterMapper.getCount(userId, "ALL_MATERIALS_COMPLETE"), 1, currentTier);
                case "STUDY_ROUNDS" -> checkTiered(counterMapper.getCount(userId, "STUDY_ROUND_VISIT"), tierThresholds, currentTier);

                // 연속 기록
                case "LOGIN_STREAK" -> checkTiered(calcMaxConsecutiveDays(achievementMapper.getLoginDates(userId)), tierThresholds, currentTier);
                case "WEEKLY_ACTIVE" -> checkTiered(calcMaxWeeklyActive(achievementMapper.getLoginDates(userId)), tierThresholds, currentTier);
                case "MONTHLY_LOGIN" -> checkTiered(calcMaxMonthlyLogin(achievementMapper.getLoginDates(userId)), tierThresholds, currentTier);
                case "STUDY_STREAK" -> checkTiered(calcMaxConsecutiveDays(counterMapper.getDistinctDates(userId, "STUDY_PAGE_VISIT")), tierThresholds, currentTier);

                // 스피드
                case "FAST_EXAM" -> checkTiered(calcFastestExam(userId), tierThresholds, currentTier, true);
                case "FIRST_SUBMIT" -> checkSimple(calcRankFirstCount(userId) > 0 ? 1 : 0, 1, currentTier);
                case "FIRST_SUBMIT_COUNT" -> checkTiered(calcRankFirstCount(userId), tierThresholds, currentTier);
                case "SPEED_PASS" -> checkTiered(calcFastestPass(userId), tierThresholds, currentTier, true);
                case "SLOW_AND_STEADY" -> checkSimple(calcSlowPass(userId) ? 1 : 0, 1, currentTier);

                // 경쟁
                case "RANK_FIRST" -> checkSimple(calcRankFirstCount(userId) > 0 ? 1 : 0, 1, currentTier);
                case "RANK_FIRST_COUNT" -> checkTiered(calcRankFirstCount(userId), tierThresholds, currentTier);
                case "RANK_TOP2" -> checkTiered(calcRankTop2Count(userId), tierThresholds, currentTier);
                case "COMEBACK" -> checkSimple(calcComeback(userId) ? 1 : 0, 1, currentTier);
                case "RIVAL_WIN" -> checkTiered(calcRivalWinMax(userId), tierThresholds, currentTier);
                case "FULL_PARTICIPATION" -> checkTiered(achievementMapper.countDistinctRounds(userId), tierThresholds, currentTier);

                // 탐험가
                case "FEATURE_EXPLORER" -> checkSimple(calcFeatureExplorer(userId) ? 1 : 0, 1, currentTier);
                case "ROUND_EXPLORER" -> checkTiered(achievementMapper.countDistinctRounds(userId), tierThresholds, currentTier);
                // 진도 마스터
                case "BOOK1_PROGRESS" -> checkTiered(calcBookProgress(userId, 1), tierThresholds, currentTier);
                case "BOOK2_PROGRESS" -> checkTiered(calcBookProgress(userId, 2), tierThresholds, currentTier);
                case "BOTH_BOOKS" -> checkTiered(Math.min(calcBookProgress(userId, 1), calcBookProgress(userId, 2)), tierThresholds, currentTier);
                case "CHAPTER_STREAK" -> checkTiered(calcChapterStreak(userId), tierThresholds, currentTier);
                case "PART_COMPLETE" -> checkSimple(calcCompletedParts(userId) > 0 ? 1 : 0, 1, currentTier);
                case "PART_COUNT" -> checkTiered(calcCompletedParts(userId), tierThresholds, currentTier);
                case "BOOK1_COMPLETE" -> checkSimple(calcBookProgress(userId, 1) >= 100 ? 1 : 0, 1, currentTier);
                case "BOOK2_COMPLETE" -> checkSimple(calcBookProgress(userId, 2) >= 100 ? 1 : 0, 1, currentTier);

                // 숨겨진
                case "EXACTLY_HALF" -> checkSimple(calcExactlyHalf(userId) ? 1 : 0, 1, currentTier);
                case "SCORE_PALINDROME" -> checkSimple(calcPalindrome(userId) ? 1 : 0, 1, currentTier);
                case "LAST_SECOND" -> checkSimple(0, 1, currentTier); // 시험 제출 시 직접 체크
                case "ZERO_HERO" -> checkSimple(calcZeroHero(userId) ? 1 : 0, 1, currentTier);
                case "FOUR_COMPLETE" -> checkSimple(achievementMapper.countFullParticipationRounds(userId) > 0 ? 1 : 0, 1, currentTier);
                case "SAME_SCORE" -> checkSimple(achievementMapper.countSameScoreExams(userId) > 0 ? 1 : 0, 1, currentTier);

                // 레전드
                case "LEGEND_SCHOLAR" -> {
                    Double avg = achievementMapper.getAvgScore(userId, 20);
                    yield checkSimple(avg != null && avg >= 27 ? 1 : 0, 1, currentTier);
                }
                case "LEGEND_MARATHON" -> checkSimple(achievementMapper.countCompletedExams(userId) >= 100 ? 1 : 0, 1, currentTier);
                case "LEGEND_COMPLETE" -> checkSimple(
                        (calcBookProgress(userId, 1) >= 100 && calcBookProgress(userId, 2) >= 100) ? 1 : 0, 1, currentTier);
                case "LEGEND_PERFECT_10" -> checkSimple(achievementMapper.countPerfectScores(userId) >= 10 ? 1 : 0, 1, currentTier);
                case "LEGEND_STREAK_30" -> checkSimple(
                        calcMaxConsecutiveDays(achievementMapper.getLoginDates(userId)) >= 30 ? 1 : 0, 1, currentTier);
                case "LEGEND_GRANDMASTER" -> checkSimple(
                        achievementMapper.countGoldOrAboveByUser(userId) >= 20 ? 1 : 0, 1, currentTier);

                default -> CheckResult.unchanged(0);
            };
        } catch (Exception e) {
            log.error("Achievement check error: userId={}, achievementId={}", userId, achievementId, e);
            return CheckResult.unchanged(0);
        }
    }

    // === 티어 체크 헬퍼 ===

    private CheckResult checkSimple(int value, int threshold, String currentTier) {
        if (value >= threshold && currentTier == null) {
            return CheckResult.unlocked(value, null);
        }
        return CheckResult.unchanged(value);
    }

    private CheckResult checkTiered(int value, String thresholdsJson, String currentTier) {
        return checkTiered(value, thresholdsJson, currentTier, false);
    }

    /**
     * 티어 체크 (reverse=true: 값이 작을수록 좋음, 스피드 업적용)
     */
    private CheckResult checkTiered(int value, String thresholdsJson, String currentTier, boolean reverse) {
        if (reverse && value <= 0) return CheckResult.unchanged(0);
        Map<String, Integer> thresholds = TierUtils.parseThresholds(objectMapper, thresholdsJson);
        if (thresholds == null) return CheckResult.unchanged(value);

        String highestNew = null;
        int currentTierIndex = TierUtils.indexOf(currentTier);

        for (int i = 0; i < TierUtils.TIER_ORDER.length; i++) {
            Integer threshold = thresholds.get(TierUtils.TIER_ORDER[i]);
            boolean met = reverse
                    ? (threshold != null && value <= threshold)
                    : (threshold != null && value >= threshold);
            if (met && i > currentTierIndex) {
                highestNew = TierUtils.TIER_ORDER[i];
            }
        }

        if (highestNew != null) {
            return CheckResult.unlocked(value, highestNew);
        }
        return CheckResult.unchanged(value);
    }

    // === 계산 헬퍼 메서드들 ===

    private int calcMaxConsecutiveDays(List<String> dateStrings) {
        if (dateStrings == null || dateStrings.isEmpty()) return 0;
        List<LocalDate> dates = dateStrings.stream()
                .map(s -> LocalDate.parse(s.trim(), DateTimeFormatter.ISO_LOCAL_DATE))
                .sorted()
                .toList();
        int max = 1, current = 1;
        for (int i = 1; i < dates.size(); i++) {
            if (dates.get(i).equals(dates.get(i - 1).plusDays(1))) {
                current++;
                max = Math.max(max, current);
            } else if (!dates.get(i).equals(dates.get(i - 1))) {
                current = 1;
            }
        }
        return max;
    }

    private int calcMaxWeeklyActive(List<String> dateStrings) {
        if (dateStrings == null || dateStrings.isEmpty()) return 0;
        Map<String, Set<Integer>> weekDays = new HashMap<>();
        for (String ds : dateStrings) {
            LocalDate d = LocalDate.parse(ds.trim());
            String weekKey = d.getYear() + "-W" + String.format("%02d", d.get(java.time.temporal.WeekFields.ISO.weekOfWeekBasedYear()));
            weekDays.computeIfAbsent(weekKey, k -> new HashSet<>()).add(d.getDayOfWeek().getValue());
        }
        return weekDays.values().stream().mapToInt(Set::size).max().orElse(0);
    }

    private int calcMaxMonthlyLogin(List<String> dateStrings) {
        if (dateStrings == null || dateStrings.isEmpty()) return 0;
        Map<String, Set<Integer>> monthDays = new HashMap<>();
        for (String ds : dateStrings) {
            LocalDate d = LocalDate.parse(ds.trim());
            String monthKey = d.getYear() + "-" + String.format("%02d", d.getMonthValue());
            monthDays.computeIfAbsent(monthKey, k -> new HashSet<>()).add(d.getDayOfMonth());
        }
        return monthDays.values().stream().mapToInt(Set::size).max().orElse(0);
    }

    private int calcPerfectStreak(Long userId) {
        // TODO: 연속 만점 계산은 total_count 포함 쿼리가 필요. 현재는 만점 수로 대체.
        int count = achievementMapper.countPerfectScores(userId);
        return count > 0 ? Math.min(count, 2) : 0;
    }

    private int calcPassStreak(Long userId) {
        List<Map<String, Object>> exams = achievementMapper.getExamDurations(userId);
        if (exams.isEmpty()) return 0;
        List<Map<String, Object>> sorted = new ArrayList<>(exams);
        Collections.reverse(sorted); // ASC로 변환
        int max = 0, current = 0;
        for (Map<String, Object> exam : sorted) {
            Object isPassed = exam.get("is_passed");
            boolean passed = isPassed != null && (isPassed.equals(true) || isPassed.equals(1) || isPassed.equals(1L));
            if (passed) {
                current++;
                max = Math.max(max, current);
            } else {
                current = 0;
            }
        }
        return max;
    }

    private int calcScoreImprovement(Long userId) {
        List<Integer> scores = achievementMapper.getRecentScores(userId, 2);
        if (scores.size() < 2) return 0;
        // scores[0] = 최근, scores[1] = 이전
        return Math.max(0, scores.get(0) - scores.get(1));
    }

    private int calcFastestExam(Long userId) {
        List<Map<String, Object>> durations = achievementMapper.getExamDurations(userId);
        return durations.stream()
                .map(d -> ((Number) d.get("duration_minutes")).intValue())
                .filter(m -> m > 0)
                .min(Integer::compareTo)
                .orElse(999);
    }

    private int calcFastestPass(Long userId) {
        List<Map<String, Object>> durations = achievementMapper.getExamDurations(userId);
        return durations.stream()
                .filter(d -> {
                    Object isPassed = d.get("is_passed");
                    return isPassed != null && (isPassed.equals(true) || isPassed.equals(1) || isPassed.equals(1L));
                })
                .map(d -> ((Number) d.get("duration_minutes")).intValue())
                .filter(m -> m > 0)
                .min(Integer::compareTo)
                .orElse(999);
    }

    private boolean calcSlowPass(Long userId) {
        List<Map<String, Object>> durations = achievementMapper.getExamDurations(userId);
        return durations.stream().anyMatch(d -> {
            Object isPassed = d.get("is_passed");
            boolean passed = isPassed != null && (isPassed.equals(true) || isPassed.equals(1) || isPassed.equals(1L));
            int minutes = ((Number) d.get("duration_minutes")).intValue();
            return passed && minutes >= 30;
        });
    }

    private int calcRankFirstCount(Long userId) {
        List<Map<String, Object>> ranks = achievementMapper.getUserRanksPerRound(userId);
        return (int) ranks.stream()
                .filter(r -> r.get("user_rank") != null && ((Number) r.get("user_rank")).intValue() == 1)
                .count();
    }

    private int calcRankTop2Count(Long userId) {
        List<Map<String, Object>> ranks = achievementMapper.getUserRanksPerRound(userId);
        return (int) ranks.stream()
                .filter(r -> r.get("user_rank") != null && ((Number) r.get("user_rank")).intValue() <= 2)
                .count();
    }

    private boolean calcComeback(Long userId) {
        List<Map<String, Object>> ranks = achievementMapper.getUserRanksPerRound(userId);
        if (ranks.size() < 2) return false;
        for (int i = 1; i < ranks.size(); i++) {
            int prevRank = ((Number) ranks.get(i - 1).get("user_rank")).intValue();
            int currRank = ((Number) ranks.get(i).get("user_rank")).intValue();
            if (prevRank >= 4 && currRank == 1) return true;
        }
        return false;
    }

    private int calcRivalWinMax(Long userId) {
        return calcRankFirstCount(userId);
    }

    private boolean calcFeatureExplorer(Long userId) {
        String[] features = {"STUDY_PAGE_VISIT", "EXAM_PAGE_VISIT", "HISTORY_PAGE_VISIT", "ANALYTICS_PAGE_VISIT", "PROGRESS_PAGE_VISIT"};
        for (String f : features) {
            if (counterMapper.getCount(userId, f) == 0) return false;
        }
        return true;
    }

    private int calcBookProgress(Long userId, int bookId) {
        List<Long> completedIds = bookChapterMapper.findCompletedChapterIdsByUserId(userId);
        long count = completedIds != null ? completedIds.size() : 0;
        // TODO: bookChapterMapper에 findCompletedChapterIdsByUserIdAndBookId 추가
        int total = 183; // Book1(83) + Book2(100)
        return total > 0 ? (int) (count * 100 / total) : 0;
    }

    private int calcChapterStreak(Long userId) {
        List<Long> ids = bookChapterMapper.findCompletedChapterIdsByUserId(userId);
        return ids != null ? ids.size() : 0;
    }

    private int calcCompletedParts(Long userId) {
        return 0; // TODO: 파트별 완료 체크 구현
    }

    private boolean calcExactlyHalf(Long userId) {
        List<Map<String, Object>> durations = achievementMapper.getExamDurations(userId);
        return durations.stream().anyMatch(d -> {
            int cc = ((Number) d.get("correct_count")).intValue();
            return cc == 15;
        });
    }

    private boolean calcPalindrome(Long userId) {
        List<Map<String, Object>> durations = achievementMapper.getExamDurations(userId);
        return durations.stream().anyMatch(d -> {
            int cc = ((Number) d.get("correct_count")).intValue();
            String s = String.valueOf(cc);
            return s.length() >= 2 && s.equals(new StringBuilder(s).reverse().toString());
        });
    }

    private boolean calcZeroHero(Long userId) {
        List<Map<String, Object>> durations = achievementMapper.getExamDurations(userId);
        return durations.stream().anyMatch(d -> ((Number) d.get("correct_count")).intValue() == 0);
    }

}
