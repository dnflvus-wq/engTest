package com.example.engTest.service;

import com.example.engTest.dto.Exam;
import com.example.engTest.dto.ExamAnswer;
import com.example.engTest.dto.Question;
import com.example.engTest.dto.Round;
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
    private final AchievementService achievementService;

    /**
     * 영어 축약형 → 풀어쓴 형태 매핑 테이블
     */
    private static final java.util.Map<String, String> CONTRACTIONS = java.util.Map.ofEntries(
            // be 동사
            java.util.Map.entry("i'm", "i am"),
            java.util.Map.entry("you're", "you are"),
            java.util.Map.entry("he's", "he is"),
            java.util.Map.entry("she's", "she is"),
            java.util.Map.entry("it's", "it is"),
            java.util.Map.entry("we're", "we are"),
            java.util.Map.entry("they're", "they are"),
            java.util.Map.entry("that's", "that is"),
            java.util.Map.entry("there's", "there is"),
            java.util.Map.entry("here's", "here is"),
            java.util.Map.entry("what's", "what is"),
            java.util.Map.entry("who's", "who is"),
            java.util.Map.entry("how's", "how is"),
            java.util.Map.entry("where's", "where is"),

            // not 축약
            java.util.Map.entry("isn't", "is not"),
            java.util.Map.entry("aren't", "are not"),
            java.util.Map.entry("wasn't", "was not"),
            java.util.Map.entry("weren't", "were not"),
            java.util.Map.entry("don't", "do not"),
            java.util.Map.entry("doesn't", "does not"),
            java.util.Map.entry("didn't", "did not"),
            java.util.Map.entry("can't", "cannot"),
            java.util.Map.entry("couldn't", "could not"),
            java.util.Map.entry("won't", "will not"),
            java.util.Map.entry("wouldn't", "would not"),
            java.util.Map.entry("shouldn't", "should not"),
            java.util.Map.entry("mustn't", "must not"),
            java.util.Map.entry("haven't", "have not"),
            java.util.Map.entry("hasn't", "has not"),
            java.util.Map.entry("hadn't", "had not"),

            // will 축약
            java.util.Map.entry("i'll", "i will"),
            java.util.Map.entry("you'll", "you will"),
            java.util.Map.entry("he'll", "he will"),
            java.util.Map.entry("she'll", "she will"),
            java.util.Map.entry("it'll", "it will"),
            java.util.Map.entry("we'll", "we will"),
            java.util.Map.entry("they'll", "they will"),
            java.util.Map.entry("that'll", "that will"),

            // would 축약
            java.util.Map.entry("i'd", "i would"),
            java.util.Map.entry("you'd", "you would"),
            java.util.Map.entry("he'd", "he would"),
            java.util.Map.entry("she'd", "she would"),
            java.util.Map.entry("it'd", "it would"),
            java.util.Map.entry("we'd", "we would"),
            java.util.Map.entry("they'd", "they would"),

            // have 축약
            java.util.Map.entry("i've", "i have"),
            java.util.Map.entry("you've", "you have"),
            java.util.Map.entry("we've", "we have"),
            java.util.Map.entry("they've", "they have"),
            java.util.Map.entry("could've", "could have"),
            java.util.Map.entry("would've", "would have"),
            java.util.Map.entry("should've", "should have"),
            java.util.Map.entry("might've", "might have"),
            java.util.Map.entry("must've", "must have"),

            // 기타
            java.util.Map.entry("let's", "let us"),
            java.util.Map.entry("y'all", "you all"));

    /**
     * 축약형을 풀어쓴 형태로 확장
     */
    private String expandContractions(String text) {
        if (text == null) {
            return "";
        }
        String result = text.toLowerCase().trim();
        for (java.util.Map.Entry<String, String> entry : CONTRACTIONS.entrySet()) {
            result = result.replace(entry.getKey(), entry.getValue());
        }
        return result;
    }

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

        // 진행 중인 시험이 있으면 이어서 진행 (resume)
        List<Exam> inProgressExams = examMapper.findInProgressByUserId(userId);
        for (Exam oldExam : inProgressExams) {
            if (oldExam.getRoundId().equals(roundId)) {
                return oldExam;
            }
        }

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

        // 업적 체크 (비동기)
        achievementService.checkAchievements(exam.getUserId(), "EXAM_COMPLETE");

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

    /**
     * 관리자용: 답안 수정 후 점수 재계산
     */
    @Transactional
    public Exam recalculateScore(Long examId) {
        Exam exam = examMapper.findById(examId);
        if (exam == null) {
            throw new IllegalArgumentException("Exam not found: " + examId);
        }

        int correctCount = examAnswerMapper.countCorrectByExamId(examId);
        Round round = roundMapper.findById(exam.getRoundId());
        int passScore = (round != null && round.getPassScore() != null) ? round.getPassScore() : 24;

        exam.setCorrectCount(correctCount);
        exam.setScore(BigDecimal.valueOf(correctCount));
        exam.setIsPassed(correctCount >= passScore);
        examMapper.update(exam);

        // 업적 재체크
        achievementService.checkAchievements(exam.getUserId(), "EXAM_COMPLETE");

        return exam;
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
     * Gemini AI 채점 결과를 저장하고 정답 수를 반환
     */
    @Transactional
    public int saveGeminiGradeResults(Long examId, List<GeminiService.OfflineGradeResult> results, List<Question> questions) {
        int correctCount = 0;
        for (GeminiService.OfflineGradeResult result : results) {
            if (result.questionNumber() > 0 && result.questionNumber() <= questions.size()) {
                Question question = questions.get(result.questionNumber() - 1);
                submitAnswer(examId, question.getId(), result.userAnswer(), null, result.isCorrect());
                if (result.isCorrect()) {
                    correctCount++;
                }
            }
        }
        return correctCount;
    }

    /**
     * 답안 정규화: 축약형 확장 후 소문자 변환 + 영숫자만 유지
     */
    private String normalizeAnswer(String answer) {
        if (answer == null) {
            return "";
        }
        // 1. 축약형 확장 (I'm -> I am 등)
        String expanded = expandContractions(answer);
        // 2. 영문자(a-z), 숫자(0-9)만 유지 (하이픈, 아포스트로피, 공백 모두 제거)
        return expanded.replaceAll("[^a-z0-9]", "");
    }

    /**
     * 정규화 후 비교하여 채점 (축약형 동등 처리 + 대체 정답)
     */
    public boolean isCorrectWithNormalization(String userAnswer, String correctAnswer, String altAnswers) {
        String normalizedUser = normalizeAnswer(userAnswer);
        if (normalizedUser.equals(normalizeAnswer(correctAnswer))) return true;
        if (altAnswers != null && !altAnswers.isBlank()) {
            for (String alt : altAnswers.split("\\|")) {
                if (normalizedUser.equals(normalizeAnswer(alt.trim()))) return true;
            }
        }
        return false;
    }

    /**
     * 사용자 확인된 답안 배열로 채점 (OCR 후 확인/수정된 답안)
     */
    @Transactional
    public Exam gradeOfflineAnswers(Long examId, List<OfflineAnswerInput> answers, List<Question> questions) {
        for (OfflineAnswerInput answer : answers) {
            if (answer.questionNumber() > 0 && answer.questionNumber() <= questions.size()) {
                Question question = questions.get(answer.questionNumber() - 1);
                boolean isCorrect = isCorrectWithNormalization(answer.userAnswer(), question.getAnswer(), question.getAltAnswers());
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
