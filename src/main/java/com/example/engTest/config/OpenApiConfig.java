package com.example.engTest.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI engTestOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("EngTest API")
                        .description("EngTest(영어 시험 시스템) 백엔드 API 명세서입니다.")
                        .version("v1.0.0"));
    }
}
