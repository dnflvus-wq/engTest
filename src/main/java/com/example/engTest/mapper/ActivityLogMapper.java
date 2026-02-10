package com.example.engTest.mapper;

import com.example.engTest.dto.ActivityLog;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface ActivityLogMapper {

    void insert(ActivityLog log);

    List<ActivityLog> findAll(
            @Param("userId") Long userId,
            @Param("action") String action,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("offset") int offset,
            @Param("limit") int limit);

    int countAll(
            @Param("userId") Long userId,
            @Param("action") String action,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    List<ActivityLog> findAllForExport(
            @Param("userId") Long userId,
            @Param("action") String action,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    int deleteOlderThan(@Param("beforeDate") LocalDateTime beforeDate);

    List<String> findDistinctActions();
}
