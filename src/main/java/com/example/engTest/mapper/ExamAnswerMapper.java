package com.example.engTest.mapper;

import com.example.engTest.dto.ExamAnswer;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ExamAnswerMapper {

    List<ExamAnswer> findByExamId(@Param("examId") Long examId);

    ExamAnswer findById(@Param("id") Long id);

    ExamAnswer findByExamAndQuestion(@Param("examId") Long examId, @Param("questionId") Long questionId);

    void insert(ExamAnswer examAnswer);

    void insertBatch(@Param("list") List<ExamAnswer> examAnswers);

    void update(ExamAnswer examAnswer);

    void updateAnswer(@Param("id") Long id, @Param("userAnswer") String userAnswer,
                      @Param("isCorrect") Boolean isCorrect, @Param("ocrRawText") String ocrRawText);

    void delete(@Param("id") Long id);

    void deleteByExamId(@Param("examId") Long examId);

    int countCorrectByExamId(@Param("examId") Long examId);

    List<ExamAnswer> findWrongAnswersByExamId(@Param("examId") Long examId);

    // 관리자: 정오답 수정
    void updateIsCorrect(@Param("id") Long id, @Param("isCorrect") Boolean isCorrect);
}
