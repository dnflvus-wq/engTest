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
@io.swagger.v3.oas.annotations.tags.Tag(name = "Study Materials", description = "학습 자료 및 단어장 관리 API")
public class MaterialController {

    private final MaterialService materialService;
    private final VocabularyService vocabularyService;

    // ===== 교육자료 API =====

    @GetMapping("/rounds/{roundId}/materials")
    @io.swagger.v3.oas.annotations.Operation(summary = "회차별 학습 자료 조회", description = "특정 회차의 학습 자료 목록을 조회합니다.")
    public ResponseEntity<List<RoundMaterial>> getMaterials(@PathVariable("roundId") Long roundId) {
        return ResponseEntity.ok(materialService.getMaterialsByRoundId(roundId));
    }

    @PostMapping("/rounds/{roundId}/materials/youtube")
    @io.swagger.v3.oas.annotations.Operation(summary = "YouTube 자료 추가", description = "회차에 YouTube 동영상 링크를 추가합니다.")
    public ResponseEntity<?> addYoutubeMaterial(
            @PathVariable("roundId") Long roundId,
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
    @io.swagger.v3.oas.annotations.Operation(summary = "PPT/PDF 자료 추가", description = "회차에 파일(PPT, PDF 등)을 업로드하여 추가합니다.")
    public ResponseEntity<?> addPptMaterial(
            @PathVariable("roundId") Long roundId,
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
    @io.swagger.v3.oas.annotations.Operation(summary = "학습 자료 삭제", description = "등록된 학습 자료를 삭제합니다.")
    public ResponseEntity<Void> deleteMaterial(@PathVariable("id") Long id) {
        materialService.deleteMaterial(id);
        return ResponseEntity.ok().build();
    }

    // ===== 단어장 API =====

    @GetMapping("/rounds/{roundId}/vocabulary")
    @io.swagger.v3.oas.annotations.Operation(summary = "회차별 단어장 조회", description = "특정 회차의 단어 목록을 조회합니다.")
    public ResponseEntity<List<VocabularyWord>> getVocabulary(@PathVariable("roundId") Long roundId) {
        return ResponseEntity.ok(vocabularyService.getVocabularyByRoundId(roundId));
    }

    @PostMapping("/rounds/{roundId}/vocabulary")
    @io.swagger.v3.oas.annotations.Operation(summary = "단어장 저장 (일괄)", description = "단어 목록을 일괄 저장합니다 (기존 목록은 유지/추가).")
    public ResponseEntity<?> saveVocabulary(
            @PathVariable("roundId") Long roundId,
            @RequestBody List<String> words) {
        try {
            vocabularyService.saveVocabulary(roundId, words);
            return ResponseEntity.ok(Map.of("message", "단어장이 저장되었습니다.", "count", words.size()));
        } catch (Exception e) {
            log.error("Failed to save vocabulary", e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/vocabulary/{id}")
    @io.swagger.v3.oas.annotations.Operation(summary = "단어 삭제", description = "단어장에서 특정 단어를 삭제합니다.")
    public ResponseEntity<Void> deleteVocabularyWord(@PathVariable("id") Long id) {
        vocabularyService.deleteWord(id);
        return ResponseEntity.ok().build();
    }
}
