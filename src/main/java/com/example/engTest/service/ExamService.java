package com.example.engTest.service;

import com.example.engTest.dto.*;
import com.example.engTest.mapper.ExamAnswerMapper;
import com.example.engTest.mapper.ExamMapper;
import com.example.engTest.mapper.QuestionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExamService {

    private final ExamMapper examMapper;
    private final ExamAnswerMapper examAnswerMapper;
    private final QuestionMapper questionMapper;

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
    public Exam startExam(Long userId, Long roundId, String mode) {
        // 해당 회차의 문제 수 조회
        int questionCount = questionMapper.countByRoundId(roundId);

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

        // 점수 계산 (100점 만점)
        BigDecimal score = BigDecimal.ZERO;
        if (exam.getTotalCount() > 0) {
            score = BigDecimal.valueOf(correctCount)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(BigDecimal.valueOf(exam.getTotalCount()), 2, RoundingMode.HALF_UP);
        }

        exam.setCorrectCount(correctCount);
        exam.setScore(score);
        exam.setStatus("COMPLETED");
        exam.setSubmittedAt(LocalDateTime.now());

        examMapper.update(exam);

        return exam;
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
}
