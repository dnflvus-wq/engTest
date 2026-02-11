package com.example.engTest.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserAchievement {
    private Long id;
    private Long userId;
    private String achievementId;
    private String tier;
    private Integer currentValue;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime unlockedAt;
    private Boolean isNotified;

    // 조인용
    private String nameKr;
    private String nameEn;
    private String descriptionKr;
    private String icon;
    private String category;
    private String badgeId;
    private String grantsBadgeAt;
    private String tierThresholds;
    private Boolean isTiered;
}
