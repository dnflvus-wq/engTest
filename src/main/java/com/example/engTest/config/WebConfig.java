package com.example.engTest.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

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
        // 업로드된 파일 접근을 위한 리소스 핸들러
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
}
