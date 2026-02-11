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
public class UserBadge {
    private Long id;
    private Long userId;
    private String badgeId;
    private Integer slotNumber;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime earnedAt;

    // 조인용
    private String nameKr;
    private String nameEn;
    private String icon;
    private String rarity;
    private String profileEffect;
    private String descriptionKr;
}
