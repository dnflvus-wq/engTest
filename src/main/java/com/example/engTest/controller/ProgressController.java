package com.example.engTest.controller;

import com.example.engTest.dto.BookChapter;
import com.example.engTest.dto.ProgressData;
import com.example.engTest.service.ProgressService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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

    @GetMapping("/chapters")
    public ResponseEntity<List<BookChapter>> getAllChapters() {
        return ResponseEntity.ok(progressService.getAllChaptersWithUsage());
    }

    @GetMapping("/rounds/{roundId}/chapters")
    public ResponseEntity<List<BookChapter>> getRoundChapters(@PathVariable("roundId") Long roundId) {
        return ResponseEntity.ok(progressService.getChaptersByRoundId(roundId));
    }

    @PostMapping("/rounds/{roundId}/chapters")
    public ResponseEntity<?> setRoundChapters(
            @PathVariable("roundId") Long roundId,
            @RequestBody Map<String, List<Long>> request) {
        List<Long> chapterIds = request.get("chapterIds");
        progressService.setRoundChapters(roundId, chapterIds);
        return ResponseEntity.ok(Map.of("message", "Chapters linked successfully"));
    }
}
