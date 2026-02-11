package com.example.engTest.controller;

import com.example.engTest.dto.ProgressData;
import com.example.engTest.service.ProgressService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class ProgressController {

    private final ProgressService progressService;

    @GetMapping
    public ResponseEntity<ProgressData> getMyProgress(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(progressService.getUserProgress(userId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ProgressData> getUserProgress(@PathVariable("userId") Long userId) {
        return ResponseEntity.ok(progressService.getUserProgress(userId));
    }
}
