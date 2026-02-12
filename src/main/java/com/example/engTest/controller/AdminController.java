package com.example.engTest.controller;

import com.example.engTest.dto.*;
import com.example.engTest.mapper.*;
import com.example.engTest.service.ExamService;
import com.example.engTest.service.QuestionService;
import com.example.engTest.service.VocabularyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AchievementMapper achievementMapper;
    private final BadgeMapper badgeMapper;
    private final ExamMapper examMapper;
    private final ExamAnswerMapper examAnswerMapper;
    private final ExamService examService;
    private final QuestionMapper questionMapper;
    private final QuestionService questionService;
    private final VocabularyService vocabularyService;

    // === Achievement Management ===

    @GetMapping("/achievements")
    public ResponseEntity<List<Achievement>> getAllAchievements() {
        return ResponseEntity.ok(achievementMapper.findAll());
    }

    @PutMapping("/achievements/{id}")
    public ResponseEntity<?> updateAchievement(@PathVariable("id") String id, @RequestBody Achievement achievement) {
        try {
            achievement.setId(id);
            achievementMapper.updateAchievement(achievement);
            return ResponseEntity.ok(achievementMapper.findById(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // === Badge Management ===

    @GetMapping("/badges")
    public ResponseEntity<List<Badge>> getAllBadges() {
        return ResponseEntity.ok(badgeMapper.findAll());
    }

    @PutMapping("/badges/{id}")
    public ResponseEntity<?> updateBadge(@PathVariable("id") String id, @RequestBody Badge badge) {
        try {
            badge.setId(id);
            badgeMapper.updateBadge(badge);
            return ResponseEntity.ok(badgeMapper.findById(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // === Exam Answer Correction ===

    @GetMapping("/rounds/{roundId}/exams")
    public ResponseEntity<List<Exam>> getExamsByRound(@PathVariable("roundId") Long roundId) {
        return ResponseEntity.ok(examMapper.findByRoundId(roundId));
    }

    @GetMapping("/exams/{examId}/answers")
    public ResponseEntity<List<ExamAnswer>> getExamAnswers(@PathVariable("examId") Long examId) {
        return ResponseEntity.ok(examAnswerMapper.findByExamId(examId));
    }

    @PutMapping("/exams/answers/{answerId}")
    public ResponseEntity<?> updateAnswerCorrectness(
            @PathVariable("answerId") Long answerId,
            @RequestBody Map<String, Boolean> request) {
        try {
            Boolean isCorrect = request.get("isCorrect");
            if (isCorrect == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "isCorrect is required"));
            }
            examAnswerMapper.updateIsCorrect(answerId, isCorrect);
            return ResponseEntity.ok(examAnswerMapper.findById(answerId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/exams/{examId}/recalculate")
    public ResponseEntity<?> recalculateScore(@PathVariable("examId") Long examId) {
        try {
            Exam exam = examService.recalculateScore(examId);
            return ResponseEntity.ok(exam);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // === Question Management ===

    @GetMapping("/rounds/{roundId}/questions")
    public ResponseEntity<List<Question>> getQuestionsByRound(@PathVariable("roundId") Long roundId) {
        return ResponseEntity.ok(questionMapper.findByRoundId(roundId));
    }

    @PutMapping("/questions/{id}")
    public ResponseEntity<?> updateQuestion(@PathVariable("id") Long id, @RequestBody Question question) {
        try {
            question.setId(id);
            questionMapper.update(question);
            return ResponseEntity.ok(questionMapper.findById(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/rounds/{roundId}/questions")
    public ResponseEntity<?> addQuestion(@PathVariable("roundId") Long roundId, @RequestBody Question question) {
        try {
            question.setRoundId(roundId);
            if (question.getSeqNo() == null) {
                question.setSeqNo(questionMapper.getMaxSeqNo(roundId) + 1);
            }
            if (question.getIsReview() == null) {
                question.setIsReview(false);
            }
            questionService.createQuestion(question);
            return ResponseEntity.ok(question);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/questions/{id}")
    public ResponseEntity<?> deleteQuestion(@PathVariable("id") Long id) {
        try {
            questionMapper.delete(id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/rounds/{roundId}/vocabulary")
    public ResponseEntity<List<VocabularyWord>> getVocabularyByRound(@PathVariable("roundId") Long roundId) {
        return ResponseEntity.ok(vocabularyService.getVocabularyByRoundId(roundId));
    }
}
