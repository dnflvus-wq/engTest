package com.example.engTest.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProgressData {
    private Long userId;
    private String userName;
    private List<BookProgress> books;
    private Integer totalVocabularyCount;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BookProgress {
        private Integer bookId;
        private String bookTitle;
        private Integer totalChapters;
        private Integer completedChapters;
        private List<PartProgress> parts;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PartProgress {
        private Integer partNumber;
        private String partTitle;
        private List<ChapterStatus> chapters;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ChapterStatus {
        private Long chapterId;
        private String chapterLabel;
        private String chapterTitle;
        private Integer seqNo;
        private boolean completed;
    }
}
