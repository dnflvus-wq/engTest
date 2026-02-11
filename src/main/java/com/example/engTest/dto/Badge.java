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
public class Badge {
    private String id;
    private String achievementId;
    private String nameKr;
    private String nameEn;
    private String descriptionKr;
    private String icon;
    private String rarity;
    private String profileEffect;
    private LocalDateTime createdAt;
}
