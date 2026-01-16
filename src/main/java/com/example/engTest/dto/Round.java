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
public class Round {
    private Long id;
    private String title;
    private String description;
    private Integer questionCount;
    private String difficulty;
    private String status;
    private LocalDateTime createdAt;
}
