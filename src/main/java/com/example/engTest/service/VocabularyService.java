package com.example.engTest.service;

import com.example.engTest.dto.VocabularyWord;
import com.example.engTest.mapper.VocabularyMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VocabularyService {

    private final VocabularyMapper vocabularyMapper;
    private final GeminiService geminiService;

    public List<VocabularyWord> getVocabularyByRoundId(Long roundId) {
        return vocabularyMapper.findByRoundId(roundId);
    }

    @Transactional
    public void saveVocabulary(Long roundId, List<String> words) {
        if (words == null || words.isEmpty()) {
            return;
        }

        // 기존 단어 개수 파악 (seqNo 계산용)
        List<VocabularyWord> existingWords = vocabularyMapper.findByRoundId(roundId);
        int seqNo = existingWords.size() + 1;

        // 새 단어 파싱
        List<String> englishWordsToGenerate = new ArrayList<>();
        List<VocabularyWord> vocabularyWords = new ArrayList<>();

        // 1차 파싱: 영어 단어 목록 추출
        for (String word : words) {
            if (word == null || word.trim().isEmpty())
                continue;
            String[] parts = word.split(":", 3);
            String english = parts[0].trim();
            if (!english.isEmpty()) {
                englishWordsToGenerate.add(english);
            }
        }

        // Gemini를 통해 발음기호 일괄 생성 (영어 단어가 있을 경우에만)
        java.util.Map<String, String> phoneticsMap = new java.util.HashMap<>();
        if (!englishWordsToGenerate.isEmpty()) {
            try {
                phoneticsMap = geminiService.generatePhonetics(englishWordsToGenerate);
            } catch (Exception e) {
                // 발음기호 생성 실패 시 로그를 남기고 빈 맵으로 진행 (단어 저장은 문제없게)
                System.err.println("Failed to generate phonetics: " + e.getMessage());
            }
        }

        // 2차 처리: 객체 생성 및 발음기호 매핑
        for (String word : words) {
            if (word == null || word.trim().isEmpty())
                continue;

            String[] parts = word.split(":", 3);
            String english = parts[0].trim();
            String korean = parts.length > 1 ? parts[1].trim() : "";
            // 사용자가 입력한 발음기호가 있으면 우선 사용, 없으면 Gemini 생성값 사용
            String phonetic = (parts.length > 2 && !parts[2].trim().isEmpty())
                    ? parts[2].trim()
                    : phoneticsMap.getOrDefault(english, "");

            if (!english.isEmpty()) {
                vocabularyWords.add(VocabularyWord.builder()
                        .roundId(roundId)
                        .english(english)
                        .korean(korean)
                        .phonetic(phonetic)
                        .seqNo(seqNo++)
                        .build());
            }
        }

        if (!vocabularyWords.isEmpty()) {
            vocabularyMapper.insertBatch(vocabularyWords);
        }
    }

    @Transactional
    public void deleteByRoundId(Long roundId) {
        vocabularyMapper.deleteByRoundId(roundId);
    }
}
