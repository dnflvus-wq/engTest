package com.example.engTest.mapper;

import com.example.engTest.dto.Question;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface QuestionMapper {

    List<Question> findByRoundId(@Param("roundId") Long roundId);

    Question findById(@Param("id") Long id);

    void insert(Question question);

    void insertBatch(@Param("list") List<Question> questions);

    void delete(@Param("id") Long id);

    void deleteByRoundId(@Param("roundId") Long roundId);

    int countByRoundId(@Param("roundId") Long roundId);

    List<Question> findByRoundIds(@Param("roundIds") List<Long> roundIds);

    void deleteReviewByRoundId(@Param("roundId") Long roundId);
}
