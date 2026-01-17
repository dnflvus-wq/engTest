package com.example.engTest.controller;

import com.example.engTest.dto.Question;
import com.example.engTest.dto.Round;
import com.example.engTest.dto.RoundStats;
import com.example.engTest.service.GeminiService;
import com.example.engTest.service.QuestionService;
import com.example.engTest.service.RoundService;
import com.example.engTest.service.VocabularyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/rounds")
@RequiredArgsConstructor
public class RoundController {

    private final RoundService roundService;
    private final QuestionService questionService;
    private final GeminiService geminiService;
    private final VocabularyService vocabularyService;

    @GetMapping
    public ResponseEntity<List<Round>> getAllRounds() {
        return ResponseEntity.ok(roundService.getAllRounds());
    }

    @GetMapping("/active")
    public ResponseEntity<List<Round>> getActiveRounds() {
        return ResponseEntity.ok(roundService.getActiveRounds());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Round> getRoundById(@PathVariable Long id) {
        Round round = roundService.getRoundById(id);
        if (round == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(round);
    }

    @PostMapping
    public ResponseEntity<Round> createRound(@RequestBody Round round) {
        Round created = roundService.createRound(round);
        return ResponseEntity.ok(created);
    }

    @PostMapping("/{id}/generate")
    public ResponseEntity<?> generateQuestions(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        try {
            Round round = roundService.getRoundById(id);
            if (round == null) {
                return ResponseEntity.notFound().build();
            }

            int count = (int) request.getOrDefault("count", round.getQuestionCount());
            String difficulty = (String) request.getOrDefault("difficulty", round.getDifficulty());
            String questionType = (String) request.getOrDefault("questionType", "WORD");
            String prompt = (String) request.get("prompt");

            if (prompt == null || prompt.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "프롬프트가 누락되었습니다."));
            }

            // 기존 문제 삭제
            questionService.deleteQuestionsByRoundId(id);

            // Gemini로 새 문제 생성
            List<Question> questions = geminiService.generateQuestions(id, prompt, count, difficulty, questionType);
            questionService.createQuestions(questions);

            return ResponseEntity.ok(Map.of(
                    "message", "문제가 생성되었습니다.",
                    "count", questions.size()));
        } catch (Exception e) {
            log.error("Failed to generate questions", e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/questions")
    public ResponseEntity<List<Question>> getQuestions(@PathVariable Long id) {
        List<Question> questions = questionService.getQuestionsByRoundId(id);
        return ResponseEntity.ok(questions);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateRound(@PathVariable Long id, @RequestBody Round round) {
        round.setId(id);
        roundService.updateRound(round);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Void> updateRoundStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        String status = request.get("status");
        roundService.updateRoundStatus(id, status);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRound(@PathVariable Long id) {
        roundService.deleteRound(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<List<RoundStats>> getRoundStats() {
        return ResponseEntity.ok(roundService.getRoundStats());
    }

    @GetMapping("/{id}/stats")
    public ResponseEntity<RoundStats> getRoundStatsById(@PathVariable Long id) {
        RoundStats stats = roundService.getRoundStatsById(id);
        if (stats == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(stats);
    }

    /**
     * 이미지들에서 단어 추출
     */
    @PostMapping("/extract-words")
    public ResponseEntity<?> extractWordsFromImages(
            @RequestParam("images") List<MultipartFile> images,
            @RequestParam(value = "prompt", required = false) String customPrompt) {
        try {
            List<String> words = geminiService.extractWordsFromImages(images, customPrompt);
            return ResponseEntity.ok(Map.of("words", words));
        } catch (Exception e) {
            log.error("Failed to extract words from images", e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 추출된 단어로 문제 생성
     */
    @PostMapping("/{id}/generate-from-words")
    public ResponseEntity<?> generateQuestionsFromWords(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        try {
            Round round = roundService.getRoundById(id);
            if (round == null) {
                return ResponseEntity.notFound().build();
            }

            @SuppressWarnings("unchecked")
            List<String> words = (List<String>) request.get("words");
            String difficulty = (String) request.getOrDefault("difficulty", "MEDIUM");
            String prompt = (String) request.get("prompt");

            if (prompt == null || prompt.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "프롬프트가 누락되었습니다."));
            }

            // 기존 문제 삭제
            questionService.deleteQuestionsByRoundId(id);

            // 단어 기반 문제 생성
            List<Question> questions = geminiService.generateQuestionsFromWords(prompt, id, difficulty);
            questionService.createQuestions(questions);

            // 단어장 저장
            vocabularyService.saveVocabulary(id, words);

            // 회차 정보 업데이트
            round.setQuestionCount(questions.size());
            round.setDifficulty(difficulty);
            roundService.updateRound(round);

            return ResponseEntity.ok(Map.of(
                    "message", "문제가 생성되었습니다.",
                    "count", questions.size()));
        } catch (Exception e) {
            log.error("Failed to generate questions from words", e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
