package com.example.engTest.service;

import com.example.engTest.dto.RoundMaterial;
import com.example.engTest.mapper.MaterialMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class MaterialService {

    private final MaterialMapper materialMapper;

    @Value("${upload.path:uploads/materials}")
    private String uploadPath;

    public List<RoundMaterial> getMaterialsByRoundId(Long roundId) {
        return materialMapper.findByRoundId(roundId);
    }

    @Transactional
    public RoundMaterial addYoutubeMaterial(Long roundId, String title, String youtubeUrl) {
        int seqNo = materialMapper.getMaxSeqNo(roundId) + 1;

        RoundMaterial material = RoundMaterial.builder()
                .roundId(roundId)
                .materialType("YOUTUBE")
                .title(title)
                .url(youtubeUrl)
                .seqNo(seqNo)
                .build();

        materialMapper.insert(material);
        return material;
    }

    @Transactional
    public RoundMaterial addPptMaterial(Long roundId, String title, MultipartFile file) throws IOException {
        Path uploadDir = Paths.get(uploadPath);
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }

        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : "";
        String newFilename = UUID.randomUUID().toString() + extension;

        Path filePath = uploadDir.resolve(newFilename);
        Files.copy(file.getInputStream(), filePath);

        int seqNo = materialMapper.getMaxSeqNo(roundId) + 1;

        RoundMaterial material = RoundMaterial.builder()
                .roundId(roundId)
                .materialType("PPT")
                .title(title != null ? title : originalFilename)
                .url("/uploads/materials/" + newFilename)
                .fileName(originalFilename)
                .seqNo(seqNo)
                .build();

        materialMapper.insert(material);
        return material;
    }

    @Transactional
    public void deleteMaterial(Long id) {
        RoundMaterial material = materialMapper.findById(id);
        deletePptFile(material);
        materialMapper.delete(id);
    }

    @Transactional
    public void deleteByRoundId(Long roundId) {
        List<RoundMaterial> materials = materialMapper.findByRoundId(roundId);
        for (RoundMaterial m : materials) {
            deletePptFile(m);
        }
        materialMapper.deleteByRoundId(roundId);
    }

    private void deletePptFile(RoundMaterial material) {
        if (material == null || !"PPT".equals(material.getMaterialType())) return;
        try {
            String url = material.getUrl();
            if (url != null && url.startsWith("/uploads/materials/")) {
                String filename = url.substring("/uploads/materials/".length());
                Files.deleteIfExists(Paths.get(uploadPath, filename));
            }
        } catch (IOException e) {
            log.warn("Failed to delete PPT file: {}", material.getUrl(), e);
        }
    }
}
