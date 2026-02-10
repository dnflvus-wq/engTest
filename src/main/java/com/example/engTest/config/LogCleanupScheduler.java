package com.example.engTest.config;

import com.example.engTest.service.ActivityLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class LogCleanupScheduler {

    private final ActivityLogService activityLogService;

    /**
     * 매일 자정에 오래된 로그 삭제
     * cron: 초 분 시 일 월 요일
     */
    @Scheduled(cron = "0 0 0 * * *")
    public void cleanupOldLogs() {
        log.info("Starting scheduled log cleanup...");
        try {
            int deletedCount = activityLogService.cleanupOldLogs();
            log.info("Scheduled log cleanup completed. Deleted {} logs.", deletedCount);
        } catch (Exception e) {
            log.error("Scheduled log cleanup failed", e);
        }
    }
}
