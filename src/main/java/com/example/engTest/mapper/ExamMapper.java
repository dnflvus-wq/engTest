package com.example.engTest.mapper;

import com.example.engTest.dto.Exam;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ExamMapper {

    List<Exam> findAll();

    List<Exam> findByUserId(@Param("userId") Long userId);

    List<Exam> findByRoundId(@Param("roundId") Long roundId);

    Exam findById(@Param("id") Long id);

    Exam findByUserAndRound(@Param("userId") Long userId, @Param("roundId") Long roundId);

    void insert(Exam exam);

    void update(Exam exam);

    void updateScore(@Param("id") Long id, @Param("correctCount") Integer correctCount, @Param("score") java.math.BigDecimal score);

    void updateStatus(@Param("id") Long id, @Param("status") String status);

    void delete(@Param("id") Long id);

    List<Exam> getRankingByRound(@Param("roundId") Long roundId);
}
