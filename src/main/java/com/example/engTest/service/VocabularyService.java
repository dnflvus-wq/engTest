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

        // 새 단어 파싱 및 저장
        List<VocabularyWord> vocabularyWords = new ArrayList<>();

        for (String word : words) {
            if (word == null || word.trim().isEmpty()) {
                continue;
            }

            String[] parts = word.split(":", 2);
            String english = parts[0].trim();
            String korean = parts.length > 1 ? parts[1].trim() : "";

            if (!english.isEmpty()) {
                vocabularyWords.add(VocabularyWord.builder()
                        .roundId(roundId)
                        .english(english)
                        .korean(korean)
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
