package com.example.engTest.service;

import com.example.engTest.dto.LogSetting;
import com.example.engTest.mapper.LogSettingMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LogSettingService {

    private final LogSettingMapper logSettingMapper;

    /**
     * 모든 설정 조회
     */
    public List<LogSetting> getAllSettings() {
        return logSettingMapper.findAll();
    }

    /**
     * 모든 설정을 Map 형태로 조회
     */
    public Map<String, String> getAllSettingsAsMap() {
        return logSettingMapper.findAll().stream()
                .collect(Collectors.toMap(LogSetting::getSettingKey, LogSetting::getSettingValue));
    }

    /**
     * 특정 설정 조회
     */
    public String getSetting(String key) {
        LogSetting setting = logSettingMapper.findByKey(key);
        return setting != null ? setting.getSettingValue() : null;
    }

    /**
     * 설정 수정
     */
    public void updateSetting(String key, String value) {
        logSettingMapper.update(key, value);
        log.info("Log setting updated: {} = {}", key, value);
    }

    /**
     * 여러 설정 일괄 수정
     */
    public void updateSettings(Map<String, String> settings) {
        for (Map.Entry<String, String> entry : settings.entrySet()) {
            logSettingMapper.update(entry.getKey(), entry.getValue());
        }
        log.info("Log settings updated: {}", settings.keySet());
    }

    /**
     * 특정 카테고리 로깅 활성화 여부
     */
    public boolean isEnabled(String settingKey) {
        String value = getSetting(settingKey);
        return "true".equalsIgnoreCase(value);
    }

    /**
     * 보관 기간 조회 (일)
     */
    public int getRetentionDays() {
        String value = getSetting("retention_days");
        try {
            return value != null ? Integer.parseInt(value) : 90;
        } catch (NumberFormatException e) {
            return 90;
        }
    }

    /**
     * 자동 삭제 활성화 여부
     */
    public boolean isAutoDeleteEnabled() {
        return isEnabled("auto_delete_enabled");
    }
}
