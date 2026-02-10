package com.example.engTest.service;

import com.example.engTest.dto.ActivityLog;
import com.example.engTest.mapper.ActivityLogMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ActivityLogService {

    private final ActivityLogMapper activityLogMapper;
    private final LogSettingService logSettingService;

    /**
     * 활동 로그 기록 (비동기)
     * Note: Request 관련 정보(ip, userAgent, path, method)는 호출 전에 미리 추출해서 전달해야 함
     */
    @Async
    public void logAsync(String action, Long userId, String userName, String targetType,
            Long targetId, String details, String ipAddress, String userAgent,
            String requestPath, String httpMethod, Integer responseStatus, Long durationMs) {
        try {
            // 해당 카테고리 로깅이 활성화되어있는지 확인
            if (!isLoggingEnabled(action)) {
                return;
            }

            ActivityLog logEntry = ActivityLog.builder()
                    .userId(userId)
                    .userName(userName)
                    .action(action)
                    .targetType(targetType)
                    .targetId(targetId)
                    .details(details)
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .requestPath(requestPath)
                    .httpMethod(httpMethod)
                    .responseStatus(responseStatus)
                    .durationMs(durationMs)
                    .build();

            activityLogMapper.insert(logEntry);
            log.debug("Activity logged: {} for user {}", action, userName);
        } catch (Exception e) {
            log.error("Failed to save activity log", e);
        }
    }

    /**
     * 로그 목록 조회 (페이징)
     */
    public Map<String, Object> getLogs(Long userId, String action,
            LocalDateTime startDate, LocalDateTime endDate, int page, int size) {
        int offset = page * size;
        List<ActivityLog> logs = activityLogMapper.findAll(userId, action, startDate, endDate, offset, size);
        int total = activityLogMapper.countAll(userId, action, startDate, endDate);

        Map<String, Object> result = new HashMap<>();
        result.put("logs", logs);
        result.put("total", total);
        result.put("page", page);
        result.put("size", size);
        result.put("totalPages", (int) Math.ceil((double) total / size));
        return result;
    }

    /**
     * 내보내기용 전체 조회
     */
    public List<ActivityLog> getLogsForExport(Long userId, String action,
            LocalDateTime startDate, LocalDateTime endDate) {
        return activityLogMapper.findAllForExport(userId, action, startDate, endDate);
    }

    /**
     * 오래된 로그 삭제
     */
    public int cleanupOldLogs() {
        int retentionDays = logSettingService.getRetentionDays();
        boolean autoDeleteEnabled = logSettingService.isAutoDeleteEnabled();

        if (!autoDeleteEnabled) {
            log.info("Auto delete is disabled, skipping log cleanup");
            return 0;
        }

        LocalDateTime beforeDate = LocalDateTime.now().minusDays(retentionDays);
        int deletedCount = activityLogMapper.deleteOlderThan(beforeDate);
        log.info("Deleted {} old logs (older than {} days)", deletedCount, retentionDays);
        return deletedCount;
    }

    /**
     * 고유 액션 목록 조회 (필터용)
     */
    public List<String> getDistinctActions() {
        return activityLogMapper.findDistinctActions();
    }

    /**
     * 특정 액션 카테고리에 대한 로깅이 활성화되어있는지 확인
     */
    private boolean isLoggingEnabled(String action) {
        if (action == null)
            return true;

        if (action.startsWith("LOGIN") || action.equals("LOGOUT")) {
            return logSettingService.isEnabled("log_login");
        } else if (action.startsWith("EXAM")) {
            return logSettingService.isEnabled("log_exam");
        } else if (action.startsWith("FILE")) {
            return logSettingService.isEnabled("log_file");
        } else if (action.startsWith("ROUND") || action.startsWith("QUESTION")) {
            return logSettingService.isEnabled("log_admin");
        } else if (action.startsWith("ERROR") || action.equals("API_ERROR")) {
            return logSettingService.isEnabled("log_error");
        }
        return true;
    }
}
