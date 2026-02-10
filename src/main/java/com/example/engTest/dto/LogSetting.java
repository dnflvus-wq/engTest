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
public class LogSetting {
    private Long id;
    private String settingKey;
    private String settingValue;
    private LocalDateTime updatedAt;
}
