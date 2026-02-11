package com.example.engTest.controller;

import com.example.engTest.dto.ActivityLog;
import com.example.engTest.service.ActivityLogService;
import com.example.engTest.service.LogSettingService;
import com.example.engTest.utils.RequestUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/logs")
@RequiredArgsConstructor
public class LogController {

    private final ActivityLogService activityLogService;
    private final LogSettingService logSettingService;

    /**
     * 로그 목록 조회 (필터, 페이징)
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getLogs(
            @RequestParam(name = "userId", required = false) Long userId,
            @RequestParam(name = "action", required = false) String action,
            @RequestParam(name = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(name = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {

        Map<String, Object> result = activityLogService.getLogs(userId, action, startDate, endDate, page, size);
        return ResponseEntity.ok(result);
    }

    /**
     * 고유 액션 목록 조회 (필터 드롭다운용)
     */
    @GetMapping("/actions")
    public ResponseEntity<List<String>> getActions() {
        return ResponseEntity.ok(activityLogService.getDistinctActions());
    }

    /**
     * 로그 내보내기용 데이터 조회
     */
    @GetMapping("/export")
    public ResponseEntity<List<ActivityLog>> exportLogs(
            @RequestParam(name = "userId", required = false) Long userId,
            @RequestParam(name = "action", required = false) String action,
            @RequestParam(name = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(name = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        List<ActivityLog> logs = activityLogService.getLogsForExport(userId, action, startDate, endDate);
        return ResponseEntity.ok(logs);
    }

    /**
     * 로그 설정 조회
     */
    @GetMapping("/settings")
    public ResponseEntity<Map<String, String>> getLogSettings() {
        return ResponseEntity.ok(logSettingService.getAllSettingsAsMap());
    }

    /**
     * 로그 설정 수정
     */
    @PutMapping("/settings")
    public ResponseEntity<?> updateLogSettings(@RequestBody Map<String, String> settings) {
        logSettingService.updateSettings(settings);
        return ResponseEntity.ok(Map.of("message", "Settings updated successfully"));
    }

    /**
     * 수동 로그 정리 (관리자용)
     */
    @PostMapping("/cleanup")
    public ResponseEntity<?> cleanupLogs() {
        int deletedCount = activityLogService.cleanupOldLogs();
        return ResponseEntity.ok(Map.of(
                "message", "Log cleanup completed",
                "deletedCount", deletedCount));
    }

    /**
     * 수동 로그 기록 (프론트엔드에서 직접 호출)
     * Study 엑셀 다운로드 등 백엔드 API 없이 처리되는 액션 로깅용
     */
    @PostMapping("/record")
    public ResponseEntity<?> recordLog(@RequestBody Map<String, Object> request,
            jakarta.servlet.http.HttpServletRequest httpRequest) {
        String action = (String) request.get("action");
        String targetType = (String) request.get("targetType");
        Long targetId = request.get("targetId") != null ? ((Number) request.get("targetId")).longValue() : null;
        String details = (String) request.get("details");

        // 세션에서 사용자 정보 추출
        Long userId = null;
        String userName = null;
        jakarta.servlet.http.HttpSession session = httpRequest.getSession(false);
        if (session != null) {
            Object sessionUserId = session.getAttribute("userId");
            Object sessionUserName = session.getAttribute("userName");
            if (sessionUserId instanceof Long) {
                userId = (Long) sessionUserId;
            } else if (sessionUserId instanceof Number) {
                userId = ((Number) sessionUserId).longValue();
            }
            if (sessionUserName instanceof String) {
                userName = (String) sessionUserName;
            }
        }

        // IP 주소 추출
        String ipAddress = RequestUtils.getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        // 로그 기록
        activityLogService.logAsync(action, userId, userName, targetType,
                targetId, details, ipAddress, userAgent,
                httpRequest.getRequestURI(), httpRequest.getMethod(),
                200, 0L);

        return ResponseEntity.ok(Map.of("message", "Log recorded successfully"));
    }

}
