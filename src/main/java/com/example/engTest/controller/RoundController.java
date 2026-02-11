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

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/rounds")
@RequiredArgsConstructor
@io.swagger.v3.oas.annotations.tags.Tag(name = "Round Management", description = "회차 및 문제 관리 API")
public class RoundController {

    private final RoundService roundService;
    private final QuestionService questionService;
    private final GeminiService geminiService;

    private final ExamService examService;
    private final VocabularyService vocabularyService;

    @GetMapping
    @io.swagger.v3.oas.annotations.Operation(summary = "전체 회차 조회", description = "모든 시험 회차를 조회합니다.")
    public ResponseEntity<List<Round>> getAllRounds() {
        return ResponseEntity.ok(roundService.getAllRounds());
    }

    @GetMapping("/active")
    @io.swagger.v3.oas.annotations.Operation(summary = "활성 회차 조회", description = "현재 활성화된 시험 회차만 조회합니다.")
    public ResponseEntity<List<Round>> getActiveRounds() {
        return ResponseEntity.ok(roundService.getActiveRounds());
    }

    @GetMapping("/{id}")
    @io.swagger.v3.oas.annotations.Operation(summary = "회차 상세 조회", description = "ID로 특정 회차 정보를 조회합니다.")
    public ResponseEntity<Round> getRoundById(@PathVariable("id") Long id) {
        Round round = roundService.getRoundById(id);
        if (round == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(round);
    }

    @PostMapping
    @io.swagger.v3.oas.annotations.Operation(summary = "새 회차 생성", description = "새로운 시험 회차를 생성합니다.")
    public ResponseEntity<Round> createRound(@RequestBody Round round) {
        Round created = roundService.createRound(round);
        return ResponseEntity.ok(created);
    }

    @PostMapping("/{id}/generate")
    @io.swagger.v3.oas.annotations.Operation(summary = "AI 문제 생성", description = "LLM(Gemini)을 사용하여 문제를 자동으로 생성합니다.")
    public ResponseEntity<?> generateQuestions(@PathVariable("id") Long id, @RequestBody Map<String, Object> request) {
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
            cleanupRoundData(id);

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
    @io.swagger.v3.oas.annotations.Operation(summary = "회차 문제 조회", description = "특정 회차에 등록된 모든 문제를 조회합니다.")
    public ResponseEntity<List<Question>> getQuestions(@PathVariable("id") Long id) {
        List<Question> questions = questionService.getQuestionsByRoundId(id);
        return ResponseEntity.ok(questions);
    }

    @PutMapping("/{id}")
    @io.swagger.v3.oas.annotations.Operation(summary = "회차 정보 수정", description = "회차의 제목, 설명 등을 수정합니다.")
    public ResponseEntity<Void> updateRound(@PathVariable("id") Long id, @RequestBody Round round) {
        round.setId(id);
        roundService.updateRound(round);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/status")
    @io.swagger.v3.oas.annotations.Operation(summary = "회차 상태 변경", description = "회차의 상태를 변경합니다 (예: ACTIVE, INACTIVE).")
    public ResponseEntity<Void> updateRoundStatus(@PathVariable("id") Long id, @RequestBody Map<String, String> request) {
        String status = request.get("status");
        roundService.updateRoundStatus(id, status);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @io.swagger.v3.oas.annotations.Operation(summary = "회차 삭제", description = "회차와 관련된 모든 데이터(문제, 시험기록 등)를 삭제합니다.")
    public ResponseEntity<Void> deleteRound(@PathVariable("id") Long id) {
        roundService.deleteRound(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/stats")
    @io.swagger.v3.oas.annotations.Operation(summary = "특정 회차 통계", description = "ID로 특정 회차의 통계를 조회합니다.")
    public ResponseEntity<RoundStats> getRoundStatsById(@PathVariable("id") Long id) {
        RoundStats stats = roundService.getRoundStatsById(id);
        if (stats == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/{id}/participants")
    @io.swagger.v3.oas.annotations.Operation(summary = "회차 참여자 목록", description = "특정 회차에 응시한 사용자 목록과 결과를 조회합니다.")
    public ResponseEntity<?> getRoundParticipants(@PathVariable("id") Long id) {
        try {
            // 1. 라운드 정보 조회하여 현재 설정된 Pass Score 가져오기
            Round round = roundService.getRoundById(id);
            if (round == null) {
                return ResponseEntity.notFound().build();
            }
            int passScore = round.getPassScore() != null ? round.getPassScore() : 0;

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
     * 추출된 단어로 문제 생성
     */
    @PostMapping("/{id}/generate-from-words")
    @io.swagger.v3.oas.annotations.Operation(summary = "단어장 기반 문제 생성", description = "추출된 단어 목록을 기반으로 문제를 생성합니다.")
    public ResponseEntity<?> generateQuestionsFromWords(
            @PathVariable("id") Long id,
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
            cleanupRoundData(id);

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
     * 현재 회차보다 이전에 생성된 회차 목록 조회
     */
    @GetMapping("/{id}/previous")
    @io.swagger.v3.oas.annotations.Operation(summary = "이전 회차 목록 조회", description = "현재 회차보다 이전에 생성된 모든 회차를 조회합니다.")
    public ResponseEntity<?> getPreviousRounds(@PathVariable("id") Long id) {
        try {
            Round currentRound = roundService.getRoundById(id);
            if (currentRound == null) {
                return ResponseEntity.notFound().build();
            }

            List<Round> allRounds = roundService.getAllRounds();
            // 현재 회차보다 먼저 생성된 회차만 필터링 (ID가 작은 것 = 먼저 생성됨)
            List<Round> previousRounds = allRounds.stream()
                    .filter(r -> r.getId() < id)
                    .toList();

            return ResponseEntity.ok(previousRounds);
        } catch (Exception e) {
            log.error("Failed to get previous rounds", e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 복습 문제 생성 - 이전 회차들에서 문제를 복사하거나 단어를 기반으로 생성
     */
    @PostMapping("/{id}/generate-review")
    @io.swagger.v3.oas.annotations.Operation(summary = "복습 문제 생성", description = "선택한 이전 회차들에서 문제를 가져와 복습 문제로 추가합니다.")
    public ResponseEntity<?> generateReviewQuestions(
            @PathVariable("id") Long id,
            @RequestBody Map<String, Object> request) {
        try {
            Round round = roundService.getRoundById(id);
            if (round == null) {
                return ResponseEntity.notFound().build();
            }

            @SuppressWarnings("unchecked")
            List<Integer> sourceRoundIds = (List<Integer>) request.get("sourceRoundIds");
            int questionCount = request.get("questionCount") != null
                    ? ((Number) request.get("questionCount")).intValue()
                    : 5;
            String sourceType = (String) request.getOrDefault("sourceType", "QUESTIONS");

            if (sourceRoundIds == null || sourceRoundIds.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "복습할 회차를 선택해주세요."));
            }

            // 기존 복습 문제만 삭제 (일반 문제는 유지)
            questionService.deleteReviewQuestionsByRoundId(id);

            List<Long> roundIds = sourceRoundIds.stream().map(Long::valueOf).toList();
            List<Question> reviewQuestions = new ArrayList<>();
            int seqNo = 1;

            if ("VOCABULARY".equalsIgnoreCase(sourceType)) {
                // 단어 기반 생성: 선택된 회차들의 단어에서 새 문제 생성
                List<VocabularyWord> vocabulary = vocabularyService.getVocabularyByRoundIds(roundIds);

                if (vocabulary.isEmpty()) {
                    return ResponseEntity.badRequest().body(Map.of("error", "선택한 회차에 단어가 없습니다."));
                }

                // 셔플 후 지정된 개수만큼 선택
                Collections.shuffle(vocabulary);
                int count = Math.min(questionCount, vocabulary.size());
                List<VocabularyWord> selectedWords = vocabulary.subList(0, count);

                // 단어에서 문제 생성 (한글 뜻 → 영어 단어)
                for (VocabularyWord word : selectedWords) {
                    reviewQuestions.add(Question.builder()
                            .roundId(id)
                            .questionType("WORD")
                            .answerType("TEXT")
                            .questionText(word.getKorean())
                            .answer(word.getEnglish())
                            .seqNo(seqNo++)
                            .isReview(true)
                            .build());
                }

                log.info("Generated {} review questions from vocabulary for round {} from rounds {}",
                        reviewQuestions.size(), id, sourceRoundIds);
            } else {
                // 기존 문제 복사: 선택된 회차들의 문제를 그대로 복사
                List<Question> sourceQuestions = questionService.getQuestionsByRoundIds(roundIds);

                if (sourceQuestions.isEmpty()) {
                    return ResponseEntity.badRequest().body(Map.of("error", "선택한 회차에 문제가 없습니다."));
                }

                // 셔플 후 지정된 개수만큼 선택
                Collections.shuffle(sourceQuestions);
                int count = Math.min(questionCount, sourceQuestions.size());
                List<Question> selectedQuestions = sourceQuestions.subList(0, count);

                // 복습 문제로 복사
                for (Question src : selectedQuestions) {
                    reviewQuestions.add(Question.builder()
                            .roundId(id)
                            .questionType(src.getQuestionType())
                            .answerType(src.getAnswerType())
                            .questionText(src.getQuestionText())
                            .answer(src.getAnswer())
                            .option1(src.getOption1())
                            .option2(src.getOption2())
                            .option3(src.getOption3())
                            .option4(src.getOption4())
                            .hint(src.getHint())
                            .seqNo(seqNo++)
                            .isReview(true)
                            .build());
                }

                log.info("Generated {} review questions by copying from round {} from rounds {}",
                        reviewQuestions.size(), id, sourceRoundIds);
            }

            questionService.createQuestions(reviewQuestions);

            return ResponseEntity.ok(Map.of(
                    "message", "복습 문제가 생성되었습니다.",
                    "count", reviewQuestions.size()));
        } catch (Exception e) {
            log.error("Failed to generate review questions", e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 복습 문제 삭제
     */
    @DeleteMapping("/{id}/review-questions")
    @io.swagger.v3.oas.annotations.Operation(summary = "복습 문제 삭제", description = "해당 회차의 복습 문제만 삭제합니다.")
    public ResponseEntity<?> deleteReviewQuestions(@PathVariable("id") Long id) {
        try {
            questionService.deleteReviewQuestionsByRoundId(id);
            return ResponseEntity.ok(Map.of("message", "복습 문제가 삭제되었습니다."));
        } catch (Exception e) {
            log.error("Failed to delete review questions", e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    private void cleanupRoundData(Long roundId) {
        examService.deleteByRoundId(roundId);
        questionService.deleteQuestionsByRoundId(roundId);
    }
}
