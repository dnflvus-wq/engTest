package com.example.engTest.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "api")
public class ApiConfig {

    private GeminiConfig gemini = new GeminiConfig();

    @Data
    public static class GeminiConfig {
        private String key;
        private String model;
        private String url;
    }
}
