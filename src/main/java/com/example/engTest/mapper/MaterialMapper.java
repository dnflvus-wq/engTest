package com.example.engTest.mapper;

import com.example.engTest.dto.RoundMaterial;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface MaterialMapper {

    List<RoundMaterial> findByRoundId(@Param("roundId") Long roundId);

    RoundMaterial findById(@Param("id") Long id);

    void insert(RoundMaterial material);

    void delete(@Param("id") Long id);

    void deleteByRoundId(@Param("roundId") Long roundId);

    int getMaxSeqNo(@Param("roundId") Long roundId);
}
