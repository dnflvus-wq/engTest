package com.example.engTest.mapper;

import com.example.engTest.dto.User;
import com.example.engTest.dto.UserStats;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface UserMapper {

    List<User> findAll();

    User findById(@Param("id") Long id);

    User findByName(@Param("name") String name);

    void insert(User user);

    void update(User user);

    void delete(@Param("id") Long id);

    List<UserStats> getUserStats();

    UserStats getUserStatsById(@Param("userId") Long userId);
}
