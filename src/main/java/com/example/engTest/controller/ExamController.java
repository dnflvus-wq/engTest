package com.example.engTest.controller;

import com.example.engTest.dto.Exam;
import com.example.engTest.dto.ExamAnswer;
import com.example.engTest.dto.Question;
import com.example.engTest.service.ExamService;
import com.example.engTest.service.GeminiService;
import com.example.engTest.service.QuestionService;
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
public class ExamController {

    private final ExamService examService;
    private final QuestionService questionService;
    private final GeminiService geminiService;

    @GetMapping
    public ResponseEntity<List<Exam>> getAllExams() {
        return ResponseEntity.ok(examService.getAllExams());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Exam> getExamById(@PathVariable Long id) {
        Exam exam = examService.getExamById(id);
        if (exam == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(exam);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Exam>> getExamsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(examService.getExamsByUserId(userId));
    }

    @GetMapping("/round/{roundId}")
    public ResponseEntity<List<Exam>> getExamsByRoundId(@PathVariable Long roundId) {
        return ResponseEntity.ok(examService.getExamsByRoundId(roundId));
    }

    @PostMapping("/start")
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
        } catch (Exception e) {
            log.error("Failed to start exam", e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{examId}/answer/{questionId}")
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
    public ResponseEntity<List<ExamAnswer>> getExamAnswers(@PathVariable Long examId) {
        return ResponseEntity.ok(examService.getExamAnswers(examId));
    }

    @GetMapping("/{examId}/wrong-answers")
    public ResponseEntity<List<ExamAnswer>> getWrongAnswers(@PathVariable Long examId) {
        return ResponseEntity.ok(examService.getWrongAnswers(examId));
    }

    @GetMapping("/ranking/{roundId}")
    public ResponseEntity<List<Exam>> getRankingByRound(@PathVariable Long roundId) {
        return ResponseEntity.ok(examService.getRankingByRound(roundId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExam(@PathVariable Long id) {
        examService.deleteExam(id);
        return ResponseEntity.ok().build();
    }

    /**
     * 오프라인 답안지 제출 및 채점
     */
    @PostMapping("/{examId}/submit-offline")
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
