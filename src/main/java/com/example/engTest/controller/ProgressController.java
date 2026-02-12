package com.example.engTest.controller;

import com.example.engTest.dto.BookChapter;
import com.example.engTest.dto.ProgressData;
import com.example.engTest.mapper.BookChapterMapper;
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
    private final BookChapterMapper bookChapterMapper;

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
        return ResponseEntity.ok(bookChapterMapper.findAllWithUsage());
    }

    @SuppressWarnings("unchecked")
    @PostMapping("/rounds/{roundId}/chapters")
    public ResponseEntity<?> assignChaptersToRound(
            @PathVariable("roundId") Long roundId,
            @RequestBody Map<String, Object> body) {
        List<Number> chapterIds = (List<Number>) body.get("chapterIds");
        if (chapterIds == null || chapterIds.isEmpty()) {
            return ResponseEntity.badRequest().body("chapterIds required");
        }
        List<Long> ids = chapterIds.stream().map(Number::longValue).toList();
        bookChapterMapper.deleteRoundChapters(roundId);
        bookChapterMapper.insertRoundChapters(roundId, ids);
        return ResponseEntity.ok().build();
    }
}
