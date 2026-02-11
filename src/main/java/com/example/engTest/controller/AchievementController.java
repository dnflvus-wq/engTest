package com.example.engTest.controller;

import com.example.engTest.dto.UserBadge;
import com.example.engTest.service.AchievementService;
import com.example.engTest.service.ActionCounterService;
import com.example.engTest.service.BadgeService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@io.swagger.v3.oas.annotations.tags.Tag(name = "Achievements & Badges", description = "업적/뱃지 시스템 API")
public class AchievementController {

    private final AchievementService achievementService;
    private final BadgeService badgeService;
    private final ActionCounterService actionCounterService;

    // === 업적 API ===

    @GetMapping("/api/achievements")
    @io.swagger.v3.oas.annotations.Operation(summary = "전체 업적 + 내 진행도", description = "모든 업적 목록과 현재 로그인 사용자의 진행 상황을 반환합니다.")
    public ResponseEntity<?> getMyAchievements(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(achievementService.getUserAchievements(userId));
    }

    @GetMapping("/api/achievements/user/{userId}")
    @io.swagger.v3.oas.annotations.Operation(summary = "특정 유저 업적 (전체공개)", description = "다른 사용자의 업적 달성 현황을 조회합니다.")
    public ResponseEntity<?> getUserAchievements(@PathVariable("userId") Long userId) {
        return ResponseEntity.ok(achievementService.getUserAchievements(userId));
    }

    @GetMapping("/api/achievements/unread")
    @io.swagger.v3.oas.annotations.Operation(summary = "미확인 업적", description = "아직 확인하지 않은 새로 달성한 업적 목록을 반환합니다.")
    public ResponseEntity<?> getUnreadAchievements(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(achievementService.getUnnotifiedAchievements(userId));
    }

    @PostMapping("/api/achievements/mark-read")
    @io.swagger.v3.oas.annotations.Operation(summary = "업적 확인 처리", description = "모달로 확인한 업적들을 읽음 처리합니다.")
    public ResponseEntity<?> markAsRead(@RequestBody Map<String, List<Long>> request, HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) return ResponseEntity.status(401).build();
        achievementService.markAsNotified(userId, request.get("ids"));
        return ResponseEntity.ok().build();
    }

    @GetMapping("/api/achievements/summary")
    @io.swagger.v3.oas.annotations.Operation(summary = "업적 요약", description = "사용자의 업적 달성 요약 (총개수, 달성수, 뱃지수)을 반환합니다.")
    public ResponseEntity<?> getSummary(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(achievementService.getSummary(userId));
    }

    @GetMapping("/api/achievements/summary/{userId}")
    @io.swagger.v3.oas.annotations.Operation(summary = "특정 유저 업적 요약 (전체공개)", description = "다른 사용자의 업적 요약을 조회합니다.")
    public ResponseEntity<?> getUserSummary(@PathVariable("userId") Long userId) {
        return ResponseEntity.ok(achievementService.getSummary(userId));
    }

    // === 뱃지 API ===

    @GetMapping("/api/badges")
    @io.swagger.v3.oas.annotations.Operation(summary = "내 뱃지 목록", description = "현재 사용자가 획득한 모든 뱃지를 반환합니다.")
    public ResponseEntity<?> getMyBadges(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(badgeService.getUserBadges(userId));
    }

    @GetMapping("/api/badges/user/{userId}")
    @io.swagger.v3.oas.annotations.Operation(summary = "특정 유저 뱃지 (전체공개)", description = "다른 사용자의 뱃지를 조회합니다.")
    public ResponseEntity<?> getUserBadges(@PathVariable("userId") Long userId) {
        return ResponseEntity.ok(badgeService.getUserBadges(userId));
    }

    @GetMapping("/api/badges/equipped")
    @io.swagger.v3.oas.annotations.Operation(summary = "장착된 뱃지", description = "현재 사용자의 장착 중인 뱃지 (5슬롯)를 반환합니다.")
    public ResponseEntity<?> getMyEquippedBadges(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(badgeService.getEquippedBadges(userId));
    }

    @GetMapping("/api/badges/equipped/all")
    @io.swagger.v3.oas.annotations.Operation(summary = "전체 유저 장착 뱃지", description = "모든 유저의 장착 중인 뱃지를 userId별로 그룹핑하여 반환합니다.")
    public ResponseEntity<?> getAllEquippedBadges() {
        return ResponseEntity.ok(badgeService.getAllEquippedBadges());
    }

    @GetMapping("/api/badges/equipped/{userId}")
    @io.swagger.v3.oas.annotations.Operation(summary = "특정 유저 장착 뱃지 (전체공개)", description = "다른 사용자의 장착 중인 뱃지를 조회합니다.")
    public ResponseEntity<?> getUserEquippedBadges(@PathVariable("userId") Long userId) {
        return ResponseEntity.ok(badgeService.getEquippedBadges(userId));
    }

    @PostMapping("/api/badges/equip")
    @io.swagger.v3.oas.annotations.Operation(summary = "뱃지 장착", description = "뱃지를 특정 슬롯(1~5)에 장착합니다.")
    public ResponseEntity<?> equipBadge(@RequestBody Map<String, Object> request, HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) return ResponseEntity.status(401).build();
        try {
            String badgeId = (String) request.get("badgeId");
            int slotNumber = ((Number) request.get("slotNumber")).intValue();
            badgeService.equipBadge(userId, badgeId, slotNumber);
            return ResponseEntity.ok(badgeService.getEquippedBadges(userId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/api/badges/unequip")
    @io.swagger.v3.oas.annotations.Operation(summary = "뱃지 해제", description = "특정 슬롯의 뱃지를 해제합니다.")
    public ResponseEntity<?> unequipBadge(@RequestBody Map<String, Object> request, HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) return ResponseEntity.status(401).build();
        int slotNumber = ((Number) request.get("slotNumber")).intValue();
        badgeService.unequipBadge(userId, slotNumber);
        return ResponseEntity.ok(badgeService.getEquippedBadges(userId));
    }

    // === 프론트엔드 액션 추적 ===

    @PostMapping("/api/actions/track")
    @io.swagger.v3.oas.annotations.Operation(summary = "액션 추적", description = "프론트엔드에서 사용자 행동(TTS클릭, 학습방문 등)을 추적합니다.")
    public ResponseEntity<?> trackAction(@RequestBody Map<String, String> request, HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) return ResponseEntity.status(401).build();
        String action = request.get("action");
        if (action == null || action.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "action is required"));
        }
        actionCounterService.increment(userId, action);
        achievementService.checkAchievements(userId, "STUDY_ACTION");
        return ResponseEntity.ok().build();
    }
}
