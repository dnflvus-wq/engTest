package com.example.engTest.mapper;

import com.example.engTest.dto.VocabularyWord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface VocabularyMapper {

    List<VocabularyWord> findByRoundId(@Param("roundId") Long roundId);

    List<VocabularyWord> findByRoundIds(@Param("roundIds") List<Long> roundIds);

    void insert(VocabularyWord word);

    void insertBatch(@Param("list") List<VocabularyWord> words);

    void deleteByRoundId(@Param("roundId") Long roundId);

    void delete(@Param("id") Long id);
}
