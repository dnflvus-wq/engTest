package com.example.engTest.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookChapter {
    private Long id;
    private Integer bookId;
    private String bookTitle;
    private Integer partNumber;
    private String partTitle;
    private Integer chapterNumber;
    private String chapterLabel;
    private String chapterTitle;
    private Integer seqNo;

    // JOIN 필드: 회차 선택 UI에서 사용
    private Boolean usedInRound;
    private Long assignedRoundId;
}
