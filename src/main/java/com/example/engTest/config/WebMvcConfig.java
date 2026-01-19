package com.example.engTest.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${upload.path:uploads/materials}")
    private String uploadPath;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // uploadPath를 절대 경로 URI로 변환하여 파일 시스템 접근 가능하게 함
        Path path = Paths.get(uploadPath).toAbsolutePath();
        String uploadUri = path.toUri().toString();

        // /uploads/materials/** 요청을 로컬 파일 시스템의 uploads/materials/ 폴더로 매핑
        registry.addResourceHandler("/uploads/materials/**")
                .addResourceLocations(uploadUri);
    }
}
