package com.example.engTest.service;

import com.example.engTest.dto.Question;
import com.example.engTest.mapper.QuestionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class QuestionService {

    private final QuestionMapper questionMapper;

    public List<Question> getQuestionsByRoundId(Long roundId) {
        return questionMapper.findByRoundId(roundId);
    }

    public Question getQuestionById(Long id) {
        return questionMapper.findById(id);
    }

    @Transactional
    public Question createQuestion(Question question) {
        questionMapper.insert(question);
        return question;
    }

    @Transactional
    public void createQuestions(List<Question> questions) {
        if (questions != null && !questions.isEmpty()) {
            questionMapper.insertBatch(questions);
        }
    }

    @Transactional
    public void updateQuestion(Question question) {
        questionMapper.update(question);
    }

    @Transactional
    public void deleteQuestion(Long id) {
        questionMapper.delete(id);
    }

    @Transactional
    public void deleteQuestionsByRoundId(Long roundId) {
        questionMapper.deleteByRoundId(roundId);
    }

    public int countByRoundId(Long roundId) {
        return questionMapper.countByRoundId(roundId);
    }

    public List<Question> getQuestionsByRoundIds(List<Long> roundIds) {
        return questionMapper.findByRoundIds(roundIds);
    }

    @Transactional
    public void deleteReviewQuestionsByRoundId(Long roundId) {
        questionMapper.deleteReviewByRoundId(roundId);
    }
}
