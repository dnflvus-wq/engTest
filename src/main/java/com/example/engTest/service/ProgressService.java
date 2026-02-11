package com.example.engTest.service;

import com.example.engTest.dto.BookChapter;
import com.example.engTest.dto.ProgressData;
import com.example.engTest.dto.User;
import com.example.engTest.mapper.BookChapterMapper;
import com.example.engTest.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProgressService {

    private final BookChapterMapper bookChapterMapper;
    private final UserMapper userMapper;

    public List<BookChapter> getAllChaptersWithUsage() {
        return bookChapterMapper.findAllWithUsage();
    }

    public List<BookChapter> getChaptersByRoundId(Long roundId) {
        return bookChapterMapper.findByRoundId(roundId);
    }

    @Transactional
    public void setRoundChapters(Long roundId, List<Long> chapterIds) {
        bookChapterMapper.deleteRoundChapters(roundId);
        if (chapterIds != null && !chapterIds.isEmpty()) {
            bookChapterMapper.insertRoundChapters(roundId, chapterIds);
        }
    }

    public ProgressData getUserProgress(Long userId) {
        User user = userMapper.findById(userId);

        List<BookChapter> allChapters = bookChapterMapper.findAllWithUsage();

        List<Long> completedIds = bookChapterMapper.findCompletedChapterIdsByUserId(userId);
        Set<Long> completedSet = new HashSet<>(completedIds);

        Integer vocabCount = bookChapterMapper.getTotalVocabularyCountByUserId(userId);

        // bookId별 그룹핑 (순서 유지)
        Map<Integer, List<BookChapter>> byBook = allChapters.stream()
                .collect(Collectors.groupingBy(BookChapter::getBookId, LinkedHashMap::new, Collectors.toList()));

        List<ProgressData.BookProgress> books = new ArrayList<>();

        for (Map.Entry<Integer, List<BookChapter>> bookEntry : byBook.entrySet()) {
            List<BookChapter> bookChapters = bookEntry.getValue();
            String bookTitle = bookChapters.get(0).getBookTitle();

            // Part별 그룹핑
            Map<Integer, List<BookChapter>> byPart = bookChapters.stream()
                    .collect(Collectors.groupingBy(BookChapter::getPartNumber, LinkedHashMap::new, Collectors.toList()));

            List<ProgressData.PartProgress> parts = new ArrayList<>();
            int completedCount = 0;

            for (Map.Entry<Integer, List<BookChapter>> partEntry : byPart.entrySet()) {
                List<ProgressData.ChapterStatus> chapterStatuses = new ArrayList<>();
                for (BookChapter ch : partEntry.getValue()) {
                    boolean isCompleted = completedSet.contains(ch.getId());
                    boolean isManual = ch.getSeqNo() <= 2; // 0회차 수기 진행분
                    if (isCompleted || isManual) completedCount++;
                    chapterStatuses.add(ProgressData.ChapterStatus.builder()
                            .chapterId(ch.getId())
                            .chapterLabel(ch.getChapterLabel())
                            .chapterTitle(ch.getChapterTitle())
                            .seqNo(ch.getSeqNo())
                            .completed(isCompleted)
                            .manuallyCompleted(isManual && !isCompleted)
                            .build());
                }
                parts.add(ProgressData.PartProgress.builder()
                        .partNumber(partEntry.getKey())
                        .partTitle(partEntry.getValue().get(0).getPartTitle())
                        .chapters(chapterStatuses)
                        .build());
            }

            books.add(ProgressData.BookProgress.builder()
                    .bookId(bookEntry.getKey())
                    .bookTitle(bookTitle)
                    .totalChapters(bookChapters.size())
                    .completedChapters(completedCount)
                    .parts(parts)
                    .build());
        }

        return ProgressData.builder()
                .userId(userId)
                .userName(user != null ? user.getName() : "Unknown")
                .books(books)
                .totalVocabularyCount(vocabCount != null ? vocabCount : 0)
                .build();
    }
}
