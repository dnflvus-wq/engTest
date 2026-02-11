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
public class AchievementProgress {
    private Long id;
    private Long userId;
    private String achievementId;
    private Integer currentValue;
    private Integer targetValue;
    private String nextTier;
    private LocalDateTime updatedAt;
}
