package com.example.engTest.controller;

import com.example.engTest.dto.Question;
import com.example.engTest.dto.Round;
import com.example.engTest.dto.RoundStats;
import com.example.engTest.dto.VocabularyWord;
import com.example.engTest.service.GeminiService;
import com.example.engTest.service.QuestionService;
import com.example.engTest.service.RoundService;
import com.example.engTest.service.VocabularyService;

import com.example.engTest.service.ExamService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.Collections;
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

    private final ExamService examService;
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

            // 기존 시험 기록 및 문제 삭제 (FK 에러 방지)
            examService.deleteByRoundId(id);
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

    @GetMapping("/{id}/participants")
    public ResponseEntity<?> getRoundParticipants(@PathVariable Long id) {
        try {
            // 1. 라운드 정보 조회하여 현재 설정된 Pass Score 가져오기
            Round round = roundService.getRoundById(id);
            if (round == null) {
                return ResponseEntity.notFound().build();
            }
            int passScore = round.getPassScore();

            var allExams = examService.getExamsByRoundId(id);
            var participants = allExams.stream()
                    .map(e -> {
                        double score = e.getScore() != null ? e.getScore().doubleValue() : 0;
                        // 2. 현재 라운드의 Pass Score와 비교하여 동적으로 Pass/Fail 판단
                        boolean isPassed = score >= passScore;

                        java.util.HashMap<String, Object> map = new java.util.HashMap<>();
                        map.put("userId", e.getUserId());
                        map.put("userName", e.getUserName() != null ? e.getUserName() : "User #" + e.getUserId());
                        map.put("status", e.getStatus() != null ? e.getStatus() : "UNKNOWN");
                        map.put("score", score);
                        map.put("isPassed", isPassed);
                        map.put("submittedAt", e.getSubmittedAt() != null ? e.getSubmittedAt().toString() : "");
                        return map;
                    })
                    .toList();
            return ResponseEntity.ok(Map.of("participants", participants, "count", participants.size()));
        } catch (Exception e) {
            log.error("Error fetching participants for round " + id, e);
            // 오류 발생 시에도 500 에러 대신 빈 목록 반환 (UI 중단 방지)
            return ResponseEntity.ok(Map.of("participants", List.of(), "count", 0));
        }
    }

    /**
     * 이미지들에서 단어 추출
     */
    @PostMapping("/extract-words")
    public ResponseEntity<?> extractWordsFromImages(
            @RequestParam("images") List<MultipartFile> images,
            @RequestParam(value = "prompt", required = false) String customPrompt) {
        try {
            // 유효성 검사
            if (images == null || images.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "이미지를 업로드해주세요."));
            }

            log.info("Extracting words from {} images", images.size());

            List<String> words = geminiService.extractWordsFromImages(images, customPrompt);

            if (words.isEmpty()) {
                log.warn("No words extracted from images");
                return ResponseEntity.ok()
                        .body(Map.of(
                                "words", words,
                                "warning", "추출된 단어가 없습니다. 이미지에 텍스트가 명확한지 확인해주세요."));
            }

            log.info("Successfully extracted {} words", words.size());
            return ResponseEntity.ok(Map.of("words", words));
        } catch (Exception e) {
            log.error("Failed to extract words from images", e);
            String errorMessage = e.getMessage() != null ? e.getMessage() : "알 수 없는 오류가 발생했습니다";
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "단어 추출 실패: " + errorMessage));
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

            String difficulty = (String) request.getOrDefault("difficulty", "MEDIUM");
            String prompt = (String) request.get("prompt");
            Integer passScore = request.get("passScore") != null ? ((Number) request.get("passScore")).intValue()
                    : null;
            int questionCount = request.get("questionCount") != null
                    ? ((Number) request.get("questionCount")).intValue()
                    : 30;

            // 기존 시험 기록 및 문제 삭제 (FK 에러 방지)
            examService.deleteByRoundId(id);
            questionService.deleteQuestionsByRoundId(id);

            List<Question> questions;

            // MEDIUM(중급/주관식): LLM 호출 없이 DB에서 직접 문제 생성
            if ("MEDIUM".equalsIgnoreCase(difficulty)) {
                List<VocabularyWord> vocabulary = vocabularyService.getVocabularyByRoundId(id);
                if (vocabulary == null || vocabulary.isEmpty()) {
                    return ResponseEntity.badRequest().body(Map.of("error", "단어가 없습니다. 먼저 단어를 입력하세요."));
                }

                // 무작위 섞기
                Collections.shuffle(vocabulary);

                // 지정된 개수만큼 추출 (단어 수가 부족하면 전체 사용)
                int count = Math.min(questionCount, vocabulary.size());
                List<VocabularyWord> selectedWords = vocabulary.subList(0, count);

                // Question 객체 직접 생성
                questions = new ArrayList<>();
                int seqNo = 1;
                for (VocabularyWord word : selectedWords) {
                    questions.add(Question.builder()
                            .roundId(id)
                            .questionType("WORD")
                            .answerType("TEXT")
                            .questionText(word.getKorean()) // 한글 뜻이 문제
                            .answer(word.getEnglish()) // 영어 단어가 정답
                            .seqNo(seqNo++)
                            .build());
                }

                log.info("Generated {} MEDIUM questions directly from DB for round {}", questions.size(), id);
            } else {
                // EASY, HARD: 기존 LLM 호출 로직
                if (prompt == null || prompt.trim().isEmpty()) {
                    return ResponseEntity.badRequest().body(Map.of("error", "프롬프트가 누락되었습니다."));
                }
                questions = geminiService.generateQuestionsFromWords(prompt, id, difficulty);
            }

            questionService.createQuestions(questions);

            // 회차 정보 업데이트
            round.setQuestionCount(questions.size());
            round.setDifficulty(difficulty);
            if (passScore != null) {
                round.setPassScore(passScore);
            }
            roundService.updateRound(round);

            return ResponseEntity.ok(Map.of(
                    "message", "문제가 생성되었습니다.",
                    "count", questions.size()));
        } catch (Exception e) {
            log.error("Failed to generate questions from words", e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 발음기호 업데이트 (AI 생성)
     */
}
