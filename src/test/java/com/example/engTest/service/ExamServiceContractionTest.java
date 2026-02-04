package com.example.engTest.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.engTest.mapper.ExamAnswerMapper;
import com.example.engTest.mapper.ExamMapper;
import com.example.engTest.mapper.QuestionMapper;
import com.example.engTest.mapper.RoundMapper;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class ExamServiceContractionTest {

    private ExamService examService;

    @Mock
    private ExamMapper examMapper;
    @Mock
    private ExamAnswerMapper examAnswerMapper;
    @Mock
    private QuestionMapper questionMapper;
    @Mock
    private RoundMapper roundMapper;

    @BeforeEach
    void setUp() {
        examService = new ExamService(examMapper, examAnswerMapper, questionMapper, roundMapper);
    }

    // ========== 축약형 테스트 ==========

    @Test
    @DisplayName("I'm = I am 동등 처리")
    void testContractionIm() {
        assertTrue(examService.isCorrectWithNormalization("I'm", "I am"));
        assertTrue(examService.isCorrectWithNormalization("I am", "I'm"));
    }

    @Test
    @DisplayName("He's = He is 동등 처리")
    void testContractionHes() {
        assertTrue(examService.isCorrectWithNormalization("He's tall", "He is tall"));
        assertTrue(examService.isCorrectWithNormalization("He is tall", "He's tall"));
    }

    @Test
    @DisplayName("don't = do not 동등 처리")
    void testContractionDont() {
        assertTrue(examService.isCorrectWithNormalization("don't", "do not"));
        assertTrue(examService.isCorrectWithNormalization("I don't know", "I do not know"));
    }

    @Test
    @DisplayName("won't = will not 동등 처리")
    void testContractionWont() {
        assertTrue(examService.isCorrectWithNormalization("won't", "will not"));
        assertTrue(examService.isCorrectWithNormalization("I won't go", "I will not go"));
    }

    @Test
    @DisplayName("can't = cannot 동등 처리")
    void testContractionCant() {
        assertTrue(examService.isCorrectWithNormalization("can't", "cannot"));
        assertTrue(examService.isCorrectWithNormalization("I can't swim", "I cannot swim"));
    }

    @Test
    @DisplayName("I've = I have 동등 처리")
    void testContractionIve() {
        assertTrue(examService.isCorrectWithNormalization("I've", "I have"));
        assertTrue(examService.isCorrectWithNormalization("I've been there", "I have been there"));
    }

    @Test
    @DisplayName("let's = let us 동등 처리")
    void testContractionLets() {
        assertTrue(examService.isCorrectWithNormalization("let's go", "let us go"));
    }

    // ========== 하이픈 테스트 ==========

    @Test
    @DisplayName("하이픈 무시: ice-cream = ice cream = icecream")
    void testHyphenIgnored() {
        assertTrue(examService.isCorrectWithNormalization("ice-cream", "ice cream"));
        assertTrue(examService.isCorrectWithNormalization("ice cream", "icecream"));
        assertTrue(examService.isCorrectWithNormalization("ice-cream", "icecream"));
    }

    @Test
    @DisplayName("복합어 하이픈 무시: e-mail = email")
    void testHyphenEmail() {
        assertTrue(examService.isCorrectWithNormalization("e-mail", "email"));
    }

    // ========== 대소문자, 공백 테스트 ==========

    @Test
    @DisplayName("대소문자 무시")
    void testCaseInsensitive() {
        assertTrue(examService.isCorrectWithNormalization("HELLO", "hello"));
        assertTrue(examService.isCorrectWithNormalization("Hello World", "hello world"));
    }

    @Test
    @DisplayName("공백 무시")
    void testSpaceIgnored() {
        assertTrue(examService.isCorrectWithNormalization("bus stop", "busstop"));
        assertTrue(examService.isCorrectWithNormalization("New York", "newyork"));
    }

    // ========== 오답 처리 테스트 ==========

    @Test
    @DisplayName("철자 오류는 오답")
    void testSpellingError() {
        assertFalse(examService.isCorrectWithNormalization("hapyy", "happy"));
        assertFalse(examService.isCorrectWithNormalization("teh", "the"));
    }

    @Test
    @DisplayName("완전히 다른 단어는 오답")
    void testDifferentWord() {
        assertFalse(examService.isCorrectWithNormalization("apple", "orange"));
        assertFalse(examService.isCorrectWithNormalization("I am happy", "I am sad"));
    }

    @Test
    @DisplayName("빈 답안 처리")
    void testEmptyAnswer() {
        assertFalse(examService.isCorrectWithNormalization("", "hello"));
        assertFalse(examService.isCorrectWithNormalization(null, "hello"));
        assertTrue(examService.isCorrectWithNormalization("", ""));
    }
}
