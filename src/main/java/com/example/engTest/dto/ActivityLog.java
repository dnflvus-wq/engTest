package com.example.engTest.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityLog {
    private Long id;
    private Long userId;
    private String userName;
    private String action;
    private String targetType;
    private Long targetId;
    private String details;
    private String ipAddress;
    private String userAgent;
    private String requestPath;
    private String httpMethod;
    private Integer responseStatus;
    private Long durationMs;
    private LocalDateTime createdAt;
}
