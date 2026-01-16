package com.example.engTest.mapper;

import com.example.engTest.dto.Round;
import com.example.engTest.dto.RoundStats;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface RoundMapper {

    List<Round> findAll();

    List<Round> findActiveRounds();

    Round findById(@Param("id") Long id);

    void insert(Round round);

    void update(Round round);

    void updateStatus(@Param("id") Long id, @Param("status") String status);

    void delete(@Param("id") Long id);

    List<RoundStats> getRoundStats();

    RoundStats getRoundStatsById(@Param("roundId") Long roundId);
}
