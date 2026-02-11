package com.example.engTest.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Achievement {
    private String id;
    private String category;
    private String nameKr;
    private String nameEn;
    private String descriptionKr;
    private String icon;
    private Boolean isHidden;
    private Boolean isTiered;
    private String tierThresholds;
    private String grantsBadgeAt;
    private String badgeId;
    private Integer displayOrder;
    private LocalDateTime createdAt;

    // 조인용: 사용자별 진행도
    private Integer currentValue;
    private Integer targetValue;
    private String currentTier;
    private String nextTier;
    private Boolean unlocked;
}
