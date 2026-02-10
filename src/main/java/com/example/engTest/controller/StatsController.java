package com.example.engTest.controller;

import com.example.engTest.dto.RoundStats;
import com.example.engTest.dto.UserStats;
import com.example.engTest.service.RoundService;
import com.example.engTest.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
@io.swagger.v3.oas.annotations.tags.Tag(name = "Statistics", description = "전체 시스템 통계 API")
public class StatsController {

    private final UserService userService;
    private final RoundService roundService;

    @GetMapping
    @io.swagger.v3.oas.annotations.Operation(summary = "대시보드 통계", description = "메인 대시보드 표시를 위한 종합 통계를 조회합니다.")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        Map<String, Object> dashboard = new HashMap<>();

        List<UserStats> userStats = userService.getUserStats();
        List<RoundStats> roundStats = roundService.getRoundStats();

        dashboard.put("userStats", userStats);
        dashboard.put("roundStats", roundStats);
        dashboard.put("totalUsers", userStats.size());
        dashboard.put("totalRounds", roundStats.size());

        // 전체 평균 점수 계산
        double totalAvg = roundStats.stream()
                .filter(s -> s.getAvgScore() != null)
                .mapToDouble(s -> s.getAvgScore().doubleValue())
                .average()
                .orElse(0.0);
        dashboard.put("overallAvgScore", Math.round(totalAvg * 100) / 100.0);

        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/users")
    @io.swagger.v3.oas.annotations.Operation(summary = "사용자 순위 통계", description = "사용자별 시험 성적 순위를 조회합니다.")
    public ResponseEntity<List<UserStats>> getUserRanking() {
        return ResponseEntity.ok(userService.getUserStats());
    }

    @GetMapping("/rounds")
    @io.swagger.v3.oas.annotations.Operation(summary = "회차별 통계", description = "회차별 평균 점수, 응시자 수 등을 조회합니다.")
    public ResponseEntity<List<RoundStats>> getRoundStats() {
        return ResponseEntity.ok(roundService.getRoundStats());
    }

    @GetMapping("/users/{userId}")
    @io.swagger.v3.oas.annotations.Operation(summary = "개인별 통계 상세", description = "ID로 특정 사용자의 통계 정보를 조회합니다.")
    public ResponseEntity<UserStats> getUserStats(@PathVariable("userId") Long userId) {
        UserStats stats = userService.getUserStatsById(userId);
        if (stats == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/rounds/{roundId}")
    @io.swagger.v3.oas.annotations.Operation(summary = "회차별 통계 상세", description = "ID로 특정 회차의 통계 정보를 조회합니다.")
    public ResponseEntity<RoundStats> getRoundStatsById(@PathVariable("roundId") Long roundId) {
        RoundStats stats = roundService.getRoundStatsById(roundId);
        if (stats == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(stats);
    }
}
