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
public class RoundMaterial {
    private Long id;
    private Long roundId;
    private String materialType; // YOUTUBE, PPT
    private String title;
    private String url;
    private String fileName;
    private Integer seqNo;
    private LocalDateTime createdAt;
}
