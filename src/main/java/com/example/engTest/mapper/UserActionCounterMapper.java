package com.example.engTest.mapper;

import com.example.engTest.dto.UserActionCounter;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface UserActionCounterMapper {

    void incrementOrInsert(@Param("userId") Long userId, @Param("action") String action);

    int getCount(@Param("userId") Long userId, @Param("action") String action);

    List<UserActionCounter> findByUser(@Param("userId") Long userId);

    List<String> getDistinctDates(@Param("userId") Long userId, @Param("action") String action);

    int countDistinctActions(@Param("userId") Long userId, @Param("prefix") String prefix);
}
