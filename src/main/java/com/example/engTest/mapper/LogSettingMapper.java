package com.example.engTest.mapper;

import com.example.engTest.dto.LogSetting;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface LogSettingMapper {

    List<LogSetting> findAll();

    LogSetting findByKey(@Param("settingKey") String settingKey);

    void update(@Param("settingKey") String settingKey, @Param("settingValue") String settingValue);

    void insertIfNotExists(@Param("settingKey") String settingKey, @Param("settingValue") String settingValue);
}
