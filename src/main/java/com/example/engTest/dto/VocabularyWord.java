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
public class VocabularyWord {
    private Long id;
    private Long roundId;
    private String english;
    private String korean;
    private String phonetic;
    private Integer seqNo;
    private LocalDateTime createdAt;
}
