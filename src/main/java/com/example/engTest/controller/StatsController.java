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
public class StatsController {

    private final UserService userService;
    private final RoundService roundService;

    @GetMapping
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
    public ResponseEntity<List<UserStats>> getUserRanking() {
        return ResponseEntity.ok(userService.getUserStats());
    }

    @GetMapping("/rounds")
    public ResponseEntity<List<RoundStats>> getRoundStats() {
        return ResponseEntity.ok(roundService.getRoundStats());
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<UserStats> getUserStats(@PathVariable Long userId) {
        UserStats stats = userService.getUserStatsById(userId);
        if (stats == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/rounds/{roundId}")
    public ResponseEntity<RoundStats> getRoundStatsById(@PathVariable Long roundId) {
        RoundStats stats = roundService.getRoundStatsById(roundId);
        if (stats == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(stats);
    }
}
