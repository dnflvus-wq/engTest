package com.example.engTest.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserStats {
    private Long userId;
    private String userName;
    private Integer totalExams;
    private BigDecimal avgScore;
    private BigDecimal maxScore;
    private Integer rank;
    private Integer achievementScore;
}
