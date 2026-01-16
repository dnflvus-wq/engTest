package com.example.engTest.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Exam {
    private Long id;
    private Long userId;
    private Long roundId;
    private String mode;
    private Integer totalCount;
    private Integer correctCount;
    private BigDecimal score;
    private String status;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;

    // 조인용 필드
    private String userName;
    private String roundTitle;
}
