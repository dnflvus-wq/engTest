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
public class UserActionCounter {
    private Long id;
    private Long userId;
    private String action;
    private Integer count;
    private LocalDateTime lastPerformedAt;
}
