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
public class Question {
    private Long id;
    private Long roundId;
    private String questionType;
    private String answerType;
    private String questionText;
    private String answer;
    private String option1;
    private String option2;
    private String option3;
    private String option4;
    private String hint;
    private Integer seqNo;
    private Boolean isReview;
    private LocalDateTime createdAt;
}
