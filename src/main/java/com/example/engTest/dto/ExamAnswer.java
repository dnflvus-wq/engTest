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
public class ExamAnswer {
    private Long id;
    private Long examId;
    private Long questionId;
    private String userAnswer;
    private Boolean isCorrect;
    private String ocrRawText;
    private String imagePath;
    private LocalDateTime createdAt;

    // 조인용 필드
    private String questionText;
    private String correctAnswer;
}
