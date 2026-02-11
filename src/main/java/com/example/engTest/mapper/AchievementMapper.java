package com.example.engTest.mapper;

import com.example.engTest.dto.Achievement;
import com.example.engTest.dto.UserAchievement;
import com.example.engTest.dto.AchievementProgress;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface AchievementMapper {

    List<Achievement> findAll();

    Achievement findById(@Param("id") String id);

    List<Achievement> findByCategory(@Param("category") String category);

    // 사용자별 업적 + 진행도 조인
    List<Achievement> findAllWithProgress(@Param("userId") Long userId);

    // 사용자 달성 업적
    List<UserAchievement> findUserAchievements(@Param("userId") Long userId);

    List<UserAchievement> findUnnotified(@Param("userId") Long userId);

    UserAchievement findUserAchievement(@Param("userId") Long userId, @Param("achievementId") String achievementId, @Param("tier") String tier);

    void insertUserAchievement(UserAchievement ua);

    void markAsNotified(@Param("userId") Long userId, @Param("ids") List<Long> ids);

    // 진행도 캐시
    AchievementProgress findProgress(@Param("userId") Long userId, @Param("achievementId") String achievementId);

    void upsertProgress(AchievementProgress progress);

    // 통계
    int countAll();

    int countUnlockedByUser(@Param("userId") Long userId);

    int countGoldOrAboveByUser(@Param("userId") Long userId);

    int calcAchievementScore(@Param("userId") Long userId);

    // 업적 체크에 필요한 쿼리들
    int countCompletedExams(@Param("userId") Long userId);

    int countPassedExams(@Param("userId") Long userId);

    Integer getMaxCorrectCount(@Param("userId") Long userId);

    Double getAvgScore(@Param("userId") Long userId, @Param("minExams") int minExams);

    int countOnlineExams(@Param("userId") Long userId);

    int countOfflineExams(@Param("userId") Long userId);

    int countTotalCorrect(@Param("userId") Long userId);

    int countPerfectScores(@Param("userId") Long userId);

    int countDistinctRounds(@Param("userId") Long userId);

    int countWeekendExams(@Param("userId") Long userId);

    // 연속 기록용 날짜 목록
    List<String> getLoginDates(@Param("userId") Long userId);

    List<String> getExamDates(@Param("userId") Long userId);

    // 랭킹 관련
    List<java.util.Map<String, Object>> getUserRanksPerRound(@Param("userId") Long userId);

    // 점수 향상 관련
    List<Integer> getRecentScores(@Param("userId") Long userId, @Param("limit") int limit);

    // 시험 시간 관련
    List<java.util.Map<String, Object>> getExamDurations(@Param("userId") Long userId);

    // 4명 완료 회차 확인
    int countFullParticipationRounds(@Param("userId") Long userId);

    // 동점자 확인
    int countSameScoreExams(@Param("userId") Long userId);
}
