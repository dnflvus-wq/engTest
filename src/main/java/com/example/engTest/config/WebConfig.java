package com.example.engTest.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${upload.path:uploads/materials}")
    private String uploadPath;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowedHeaders("*");
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // /admin 경로를 admin.html로 매핑
        registry.addViewController("/admin").setViewName("forward:/admin.html");
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Materials 전용: 절대 경로 URI로 변환하여 파일 시스템 접근
        Path path = Paths.get(uploadPath).toAbsolutePath();
        String uploadUri = path.toUri().toString();
        registry.addResourceHandler("/uploads/materials/**")
                .addResourceLocations(uploadUri);

        // 일반 업로드 파일 접근
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
}
