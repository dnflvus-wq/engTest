package com.example.engTest.controller;

import com.example.engTest.dto.RoundMaterial;
import com.example.engTest.dto.VocabularyWord;
import com.example.engTest.service.MaterialService;
import com.example.engTest.service.VocabularyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MaterialController {

    private final MaterialService materialService;
    private final VocabularyService vocabularyService;

    // ===== 교육자료 API =====

    @GetMapping("/rounds/{roundId}/materials")
    public ResponseEntity<List<RoundMaterial>> getMaterials(@PathVariable Long roundId) {
        return ResponseEntity.ok(materialService.getMaterialsByRoundId(roundId));
    }

    @PostMapping("/rounds/{roundId}/materials/youtube")
    public ResponseEntity<?> addYoutubeMaterial(
            @PathVariable Long roundId,
            @RequestBody Map<String, String> request) {
        try {
            String title = request.get("title");
            String url = request.get("url");

            if (url == null || url.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "URL이 필요합니다."));
            }

            RoundMaterial material = materialService.addYoutubeMaterial(roundId, title, url);
            return ResponseEntity.ok(material);
        } catch (Exception e) {
            log.error("Failed to add youtube material", e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/rounds/{roundId}/materials/ppt")
    public ResponseEntity<?> addPptMaterial(
            @PathVariable Long roundId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "title", required = false) String title) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "파일이 필요합니다."));
            }

            RoundMaterial material = materialService.addPptMaterial(roundId, title, file);
            return ResponseEntity.ok(material);
        } catch (Exception e) {
            log.error("Failed to add ppt material", e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/materials/{id}")
    public ResponseEntity<Void> deleteMaterial(@PathVariable Long id) {
        materialService.deleteMaterial(id);
        return ResponseEntity.ok().build();
    }

    // ===== 단어장 API =====

    @GetMapping("/rounds/{roundId}/vocabulary")
    public ResponseEntity<List<VocabularyWord>> getVocabulary(@PathVariable Long roundId) {
        return ResponseEntity.ok(vocabularyService.getVocabularyByRoundId(roundId));
    }

    @PostMapping("/rounds/{roundId}/vocabulary")
    public ResponseEntity<?> saveVocabulary(
            @PathVariable Long roundId,
            @RequestBody List<String> words) {
        try {
            vocabularyService.saveVocabulary(roundId, words);
            return ResponseEntity.ok(Map.of("message", "단어장이 저장되었습니다.", "count", words.size()));
        } catch (Exception e) {
            log.error("Failed to save vocabulary", e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
