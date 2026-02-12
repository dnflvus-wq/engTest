package com.example.engTest.mapper;

import com.example.engTest.dto.BookChapter;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface BookChapterMapper {

    List<BookChapter> findAllWithUsage();

    List<BookChapter> findByBookId(@Param("bookId") Integer bookId);

    List<BookChapter> findByRoundId(@Param("roundId") Long roundId);

    void insertRoundChapters(@Param("roundId") Long roundId, @Param("chapterIds") List<Long> chapterIds);

    void deleteRoundChapters(@Param("roundId") Long roundId);

    List<Long> findCompletedChapterIdsByUserId(@Param("userId") Long userId);

    List<Long> findCompletedChapterIdsByUserIdAndBookId(@Param("userId") Long userId, @Param("bookId") int bookId);

    int countCompletedParts(@Param("userId") Long userId);

    Integer getTotalVocabularyCountByUserId(@Param("userId") Long userId);
}
