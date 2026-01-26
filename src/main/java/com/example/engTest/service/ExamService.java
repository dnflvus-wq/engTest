package com.example.engTest.service;

import com.example.engTest.dto.*;
import com.example.engTest.mapper.ExamAnswerMapper;
import com.example.engTest.mapper.ExamMapper;
import com.example.engTest.mapper.QuestionMapper;
import com.example.engTest.mapper.RoundMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExamService {

    private final ExamMapper examMapper;
    private final ExamAnswerMapper examAnswerMapper;
    private final QuestionMapper questionMapper;
    private final RoundMapper roundMapper;

    public List<Exam> getAllExams() {
        return examMapper.findAll();
    }

    public List<Exam> getExamsByUserId(Long userId) {
        return examMapper.findByUserId(userId);
    }

    public List<Exam> getExamsByRoundId(Long roundId) {
        return examMapper.findByRoundId(roundId);
    }

    public Exam getExamById(Long id) {
        return examMapper.findById(id);
    }

    @Transactional
    public synchronized Exam startExam(Long userId, Long roundId, String mode) {
        // [NEW] 이미 제출(COMPLETED)된 시험이 있는지 확인
        Exam existingExam = examMapper.findByUserAndRound(userId, roundId);
        if (existingExam != null && "COMPLETED".equals(existingExam.getStatus())) {
            throw new IllegalStateException("You have already completed this exam round.");
        }

        // [Resume & Cleanup] Check for existing IN_PROGRESS exams
        List<Exam> inProgressExams = examMapper.findInProgressByUserId(userId);

        // Check if there is an existing exam for THIS round
        for (Exam oldExam : inProgressExams) {
            if (oldExam.getRoundId().equals(roundId)) {
                // RESUME: Found incomplete exam for this round -> Return it!
                // (Other in-progress exams for DIFFERENT rounds will remain until they are
                // started and cleaned up,
                // OR we can clean them up now. Let's clean up others to keep DB clean.)
                // RESUME: Found incomplete exam for this round -> Return it!
                // (Only resume the exam for THIS round. Do not touch others.)
                return oldExam;
            }
        }

        // If we reached here, no exam for this round exists.
        // [CHANGED] "In Progress" Exam Cleanup Logic Removed
        // We now allow multiple "In Progress" exams (one per round).
        // The frontend handles navigation to the correct exam based on the round.

        // --- Create NEW Exam ---
        // 해당 회차의 문제 수 조회
        int questionCount = questionMapper.countByRoundId(roundId);

        // [NEW] Validation: Prevent starting exam if no questions exist
        if (questionCount == 0) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "No questions have been generated for this round yet. Please generate questions first.");
        }

        Exam exam = Exam.builder()
                .userId(userId)
                .roundId(roundId)
                .mode(mode)
                .totalCount(questionCount)
                .correctCount(0)
                .score(BigDecimal.ZERO)
                .status("IN_PROGRESS")
                .build();

        examMapper.insert(exam);

        // 빈 답안 레코드 생성
        List<Question> questions = questionMapper.findByRoundId(roundId);
        List<ExamAnswer> answers = new ArrayList<>();
        for (Question q : questions) {
            answers.add(ExamAnswer.builder()
                    .examId(exam.getId())
                    .questionId(q.getId())
                    .isCorrect(false)
                    .build());
        }
        if (!answers.isEmpty()) {
            examAnswerMapper.insertBatch(answers);
        }

        return exam;
    }

    @Transactional
    public void submitAnswer(Long examId, Long questionId, String userAnswer, String ocrRawText, boolean isCorrect) {
        ExamAnswer answer = examAnswerMapper.findByExamAndQuestion(examId, questionId);
        if (answer != null) {
            examAnswerMapper.updateAnswer(answer.getId(), userAnswer, isCorrect, ocrRawText);
        }
    }

    @Transactional
    public Exam submitExam(Long examId) {
        Exam exam = examMapper.findById(examId);
        if (exam == null) {
            throw new IllegalArgumentException("Exam not found: " + examId);
        }

        // 정답 수 계산
        int correctCount = examAnswerMapper.countCorrectByExamId(examId);

        // 점수 계산 (정답 수 = 점수, 즉 문항 수 기준 만점)
        BigDecimal score = BigDecimal.valueOf(correctCount);

        // Pass/Fail 판정: Round의 passScore와 비교
        Round round = roundMapper.findById(exam.getRoundId());
        int passScore = (round != null && round.getPassScore() != null) ? round.getPassScore() : 24;
        boolean isPassed = correctCount >= passScore;

        exam.setCorrectCount(correctCount);
        exam.setScore(score);
        exam.setIsPassed(isPassed);
        exam.setStatus("COMPLETED");
        exam.setSubmittedAt(LocalDateTime.now());

        examMapper.update(exam);

        // Auto-complete round if 4 users have completed
        int completedCount = examMapper.countCompletedByRoundId(exam.getRoundId());
        if (completedCount >= 4) {
            roundMapper.updateStatus(exam.getRoundId(), "COMPLETED");
        }

        return exam;
    }

    public List<Exam> getCompletedExamsByRoundId(Long roundId) {
        return examMapper.findCompletedByRoundId(roundId);
    }

    public List<ExamAnswer> getExamAnswers(Long examId) {
        return examAnswerMapper.findByExamId(examId);
    }

    public List<ExamAnswer> getWrongAnswers(Long examId) {
        return examAnswerMapper.findWrongAnswersByExamId(examId);
    }

    public List<Exam> getRankingByRound(Long roundId) {
        return examMapper.getRankingByRound(roundId);
    }

    @Transactional
    public void deleteExam(Long id) {
        examAnswerMapper.deleteByExamId(id);
        examMapper.delete(id);
    }

    @Transactional
    public void deleteByRoundId(Long roundId) {
        // 해당 회차의 모든 Exam들을 찾아서 삭제
        List<Exam> exams = examMapper.findByRoundId(roundId);
        for (Exam exam : exams) {
            examAnswerMapper.deleteByExamId(exam.getId());
        }
        examMapper.deleteByRoundId(roundId);
    }

    /**
     * 답안 정규화: 소문자 변환 + 영문자/숫자/하이픈/아포스트로피만 유지 + 공백 제거
     */
    public String normalizeAnswer(String answer) {
        if (answer == null) {
            return "";
        }
        // 1. 소문자로 변환
        String normalized = answer.toLowerCase();
        // 2. 영문자(a-z), 숫자(0-9), 하이픈(-), 아포스트로피(') 만 유지
        normalized = normalized.replaceAll("[^a-z0-9\\-']", "");
        return normalized;
    }

    /**
     * 정규화 후 비교하여 채점
     */
    public boolean isCorrectWithNormalization(String userAnswer, String correctAnswer) {
        String normalizedUser = normalizeAnswer(userAnswer);
        String normalizedCorrect = normalizeAnswer(correctAnswer);
        return normalizedUser.equals(normalizedCorrect);
    }

    /**
     * 사용자 확인된 답안 배열로 채점 (OCR 후 확인/수정된 답안)
     */
    @Transactional
    public Exam gradeOfflineAnswers(Long examId, List<OfflineAnswerInput> answers, List<Question> questions) {
        for (OfflineAnswerInput answer : answers) {
            if (answer.questionNumber() > 0 && answer.questionNumber() <= questions.size()) {
                Question question = questions.get(answer.questionNumber() - 1);
                boolean isCorrect = isCorrectWithNormalization(answer.userAnswer(), question.getAnswer());
                submitAnswer(examId, question.getId(), answer.userAnswer(), null, isCorrect);
            }
        }
        return submitExam(examId);
    }

    /**
     * 오프라인 답안 입력 레코드
     */
    public record OfflineAnswerInput(
            int questionNumber,
            String userAnswer) {
    }
}
