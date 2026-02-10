package com.example.engTest.controller;

import com.example.engTest.dto.Exam;
import com.example.engTest.dto.ExamAnswer;
import com.example.engTest.dto.Question;
import com.example.engTest.service.ExamService;
import com.example.engTest.service.GeminiService;
import com.example.engTest.service.QuestionService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/exams")
@RequiredArgsConstructor
@io.swagger.v3.oas.annotations.tags.Tag(name = "Exam & Grading", description = "시험 응시, 채점, OCR 관련 API")
public class ExamController {

    private final ExamService examService;
    private final QuestionService questionService;
    private final GeminiService geminiService;

    @GetMapping
    @io.swagger.v3.oas.annotations.Operation(summary = "전체 시험 조회", description = "모든 시험 기록을 조회합니다.")
    public ResponseEntity<List<Exam>> getAllExams() {
        return ResponseEntity.ok(examService.getAllExams());
    }

    @GetMapping("/history")
    @io.swagger.v3.oas.annotations.Operation(summary = "내 시험 기록 조회", description = "현재 로그인한 사용자의 시험 기록을 조회합니다.")
    public ResponseEntity<List<Exam>> getMyExamHistory(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(examService.getExamsByUserId(userId));
    }

    @GetMapping("/{id}")
    @io.swagger.v3.oas.annotations.Operation(summary = "시험 상세 조회", description = "ID로 특정 시험 정보를 조회합니다.")
    public ResponseEntity<Exam> getExamById(@PathVariable Long id) {
        Exam exam = examService.getExamById(id);
        if (exam == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(exam);
    }

    @GetMapping("/user/{userId}")
    @io.swagger.v3.oas.annotations.Operation(summary = "사용자별 시험 기록", description = "특정 사용자의 모든 시험 기록을 조회합니다.")
    public ResponseEntity<List<Exam>> getExamsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(examService.getExamsByUserId(userId));
    }

    @GetMapping("/round/{roundId}")
    @io.swagger.v3.oas.annotations.Operation(summary = "회차별 시험 기록", description = "특정 회차의 모든 시험 기록을 조회합니다.")
    public ResponseEntity<List<Exam>> getExamsByRoundId(@PathVariable Long roundId) {
        return ResponseEntity.ok(examService.getExamsByRoundId(roundId));
    }

    @PostMapping("/start")
    @io.swagger.v3.oas.annotations.Operation(summary = "시험 시작", description = "새로운 시험을 시작합니다 (중복 응시 불가).")
    public ResponseEntity<?> startExam(@RequestBody Map<String, Object> request) {
        try {
            if (request.get("userId") == null || request.get("roundId") == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "userId와 roundId가 필요합니다."));
            }

            Long userId = Long.valueOf(String.valueOf(request.get("userId")));
            Long roundId = Long.valueOf(String.valueOf(request.get("roundId")));
            String mode = (String) request.getOrDefault("mode", "ONLINE"); // 기본값 ONLINE

            Exam exam = examService.startExam(userId, roundId, mode);
            return ResponseEntity.ok(exam);
        } catch (org.springframework.web.server.ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(Map.of("error", e.getReason()));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to start exam", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "An unexpected error occurred: " + e.getMessage()));
        }
    }

    @PostMapping("/{examId}/answer/{questionId}")
    @io.swagger.v3.oas.annotations.Operation(summary = "답안 제출 (이미지)", description = "이미지를 업로드하여 OCR 채점 후 답안을 저장합니다.")
    public ResponseEntity<?> submitAnswer(
            @PathVariable Long examId,
            @PathVariable Long questionId,
            @RequestParam("image") MultipartFile image,
            @RequestParam("prompt") String prompt) {
        try {
            // 정답 확인
            Question question = questionService.getQuestionById(questionId);

            // Gemini Vision으로 이미지 채점
            GeminiService.GradeResult result = geminiService.gradeImageAnswer(image, prompt, question.getAnswer());

            // 답안 저장
            examService.submitAnswer(examId, questionId, result.extractedText(), result.extractedText(),
                    result.isCorrect());

            return ResponseEntity.ok(Map.of(
                    "extractedText", result.extractedText(),
                    "correctAnswer", question.getAnswer(),
                    "isCorrect", result.isCorrect(),
                    "feedback", result.feedback(),
                    "imagePath", result.imagePath() != null ? result.imagePath() : ""));
        } catch (Exception e) {
            log.error("Failed to submit answer", e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{examId}/answer/{questionId}/text")
    @io.swagger.v3.oas.annotations.Operation(summary = "답안 제출 (텍스트)", description = "텍스트 답안을 제출하고 채점합니다.")
    public ResponseEntity<?> submitTextAnswer(
            @PathVariable Long examId,
            @PathVariable Long questionId,
            @RequestBody Map<String, String> request) {
        try {
            String userAnswer = request.get("answer");

            // 정답 확인
            Question question = questionService.getQuestionById(questionId);

            // Gemini로 텍스트 채점
            GeminiService.GradeResult result = geminiService.gradeTextAnswer(userAnswer, question.getAnswer());

            // 답안 저장
            examService.submitAnswer(examId, questionId, userAnswer, null, result.isCorrect());

            return ResponseEntity.ok(Map.of(
                    "userAnswer", userAnswer,
                    "correctAnswer", question.getAnswer(),
                    "isCorrect", result.isCorrect(),
                    "feedback", result.feedback()));
        } catch (Exception e) {
            log.error("Failed to submit answer", e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{examId}/submit")
    @io.swagger.v3.oas.annotations.Operation(summary = "시험 제출 (종료)", description = "시험을 종료하고 최종 점수를 계산합니다.")
    public ResponseEntity<?> submitExam(@PathVariable Long examId) {
        try {
            Exam exam = examService.submitExam(examId);
            return ResponseEntity.ok(exam);
        } catch (Exception e) {
            log.error("Failed to submit exam", e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{examId}/answers")
    @io.swagger.v3.oas.annotations.Operation(summary = "시험 답안 조회", description = "특정 시험의 제출된 답안 목록을 조회합니다.")
    public ResponseEntity<List<ExamAnswer>> getExamAnswers(@PathVariable Long examId) {
        return ResponseEntity.ok(examService.getExamAnswers(examId));
    }

    @GetMapping("/{examId}/wrong-answers")
    @io.swagger.v3.oas.annotations.Operation(summary = "오답 조회", description = "특정 시험의 오답 목록만 조회합니다.")
    public ResponseEntity<List<ExamAnswer>> getWrongAnswers(@PathVariable Long examId) {
        return ResponseEntity.ok(examService.getWrongAnswers(examId));
    }

    @GetMapping("/ranking/{roundId}")
    @io.swagger.v3.oas.annotations.Operation(summary = "회차별 순위", description = "특정 회차의 석차(랭킹)를 조회합니다.")
    public ResponseEntity<List<Exam>> getRankingByRound(@PathVariable Long roundId) {
        return ResponseEntity.ok(examService.getRankingByRound(roundId));
    }

    @DeleteMapping("/{id}")
    @io.swagger.v3.oas.annotations.Operation(summary = "시험 기록 삭제", description = "특정 시험 기록을 삭제합니다.")
    public ResponseEntity<Void> deleteExam(@PathVariable Long id) {
        examService.deleteExam(id);
        return ResponseEntity.ok().build();
    }

    /**
     * 오프라인 답안지 OCR (답안 추출만, 채점 X)
     */
    @PostMapping("/{examId}/ocr")
    @io.swagger.v3.oas.annotations.Operation(summary = "오프라인 답안 OCR 추출", description = "오프라인 답안지 이미지를 업로드하여 답안 텍스트만 추출합니다 (채점 X).")
    public ResponseEntity<?> extractAnswersFromImage(
            @PathVariable Long examId,
            @RequestParam("answerSheet") MultipartFile answerSheet) {
        try {
            Exam exam = examService.getExamById(examId);
            if (exam == null) {
                return ResponseEntity.notFound().build();
            }

            // 해당 회차의 문제 수 조회
            List<Question> questions = questionService.getQuestionsByRoundId(exam.getRoundId());

            // Gemini로 OCR 수행 (채점 없이 답안만 추출)
            List<GeminiService.OcrResult> ocrResults = geminiService.extractAnswersFromImage(answerSheet,
                    questions.size());

            return ResponseEntity.ok(Map.of(
                    "examId", examId,
                    "ocrResults", ocrResults,
                    "questionCount", questions.size()));
        } catch (Exception e) {
            log.error("Failed to extract answers from image", e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 사용자 확인/수정된 오프라인 답안 채점
     */
    @PostMapping("/{examId}/submit-offline-graded")
    @io.swagger.v3.oas.annotations.Operation(summary = "오프라인 답안 최종 제출", description = "OCR 후 사용자가 검토한 답안을 최종 제출하고 채점합니다.")
    public ResponseEntity<?> submitOfflineGradedAnswers(
            @PathVariable Long examId,
            @RequestBody List<Map<String, Object>> answers) {
        try {
            Exam exam = examService.getExamById(examId);
            if (exam == null) {
                return ResponseEntity.notFound().build();
            }

            // 해당 회차의 문제 목록 조회
            List<Question> questions = questionService.getQuestionsByRoundId(exam.getRoundId());

            // 입력을 OfflineAnswerInput으로 변환
            List<ExamService.OfflineAnswerInput> answerInputs = answers.stream()
                    .map(a -> new ExamService.OfflineAnswerInput(
                            ((Number) a.get("questionNumber")).intValue(),
                            (String) a.get("userAnswer")))
                    .toList();

            // 정규화 비교로 채점
            Exam completedExam = examService.gradeOfflineAnswers(examId, answerInputs, questions);

            return ResponseEntity.ok(Map.of(
                    "exam", completedExam,
                    "correctCount", completedExam.getCorrectCount(),
                    "totalCount", questions.size()));
        } catch (Exception e) {
            log.error("Failed to grade offline answers", e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 오프라인 답안지 제출 및 채점 (레거시 - 이전 방식 호환용)
     */
    @PostMapping("/{examId}/submit-offline")
    @io.swagger.v3.oas.annotations.Operation(summary = "오프라인 답안지 제출 (구버전)", description = "[Legacy] 답안지 이미지를 업로드하여 즉시 채점합니다.")
    public ResponseEntity<?> submitOfflineAnswerSheet(
            @PathVariable Long examId,
            @RequestParam("answerSheet") MultipartFile answerSheet,
            @RequestParam("prompt") String prompt) {
        try {
            Exam exam = examService.getExamById(examId);
            if (exam == null) {
                return ResponseEntity.notFound().build();
            }

            // 해당 회차의 문제 목록 조회
            List<Question> questions = questionService.getQuestionsByRoundId(exam.getRoundId());

            // Gemini로 답안지 채점
            List<GeminiService.OfflineGradeResult> results = geminiService.gradeOfflineAnswerSheet(answerSheet, prompt,
                    questions);

            // 각 답안 저장 및 정답 카운트
            int correctCount = 0;
            for (GeminiService.OfflineGradeResult result : results) {
                if (result.questionNumber() > 0 && result.questionNumber() <= questions.size()) {
                    Question question = questions.get(result.questionNumber() - 1);
                    examService.submitAnswer(examId, question.getId(), result.userAnswer(), null, result.isCorrect());
                    if (result.isCorrect()) {
                        correctCount++;
                    }
                }
            }

            // 시험 제출 처리
            Exam completedExam = examService.submitExam(examId);

            return ResponseEntity.ok(Map.of(
                    "exam", completedExam,
                    "results", results,
                    "correctCount", correctCount,
                    "totalCount", questions.size()));
        } catch (Exception e) {
            log.error("Failed to grade offline answer sheet", e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
