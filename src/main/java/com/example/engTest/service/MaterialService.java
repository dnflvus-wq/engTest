package com.example.engTest.service;

import com.example.engTest.dto.RoundMaterial;
import com.example.engTest.mapper.MaterialMapper;
import lombok.RequiredArgsConstructor;
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

@Service
@RequiredArgsConstructor
public class MaterialService {

    private final MaterialMapper materialMapper;

    @Value("${upload.path:uploads/materials}")
    private String uploadPath;

    public List<RoundMaterial> getMaterialsByRoundId(Long roundId) {
        return materialMapper.findByRoundId(roundId);
    }

    public RoundMaterial getMaterialById(Long id) {
        return materialMapper.findById(id);
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
        // 업로드 디렉토리 생성
        Path uploadDir = Paths.get(uploadPath);
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }

        // 파일명 생성 (UUID + 원본 파일명)
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : "";
        String newFilename = UUID.randomUUID().toString() + extension;

        // 파일 저장
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
        if (material != null && "PPT".equals(material.getMaterialType())) {
            // PPT 파일인 경우 실제 파일도 삭제
            try {
                String url = material.getUrl();
                if (url != null && url.startsWith("/uploads/materials/")) {
                    String filename = url.substring("/uploads/materials/".length());
                    Path filePath = Paths.get(uploadPath, filename);
                    Files.deleteIfExists(filePath);
                }
            } catch (IOException e) {
                // 파일 삭제 실패해도 DB 레코드는 삭제
            }
        }
        materialMapper.delete(id);
    }

    @Transactional
    public void deleteByRoundId(Long roundId) {
        // 먼저 파일들 삭제
        List<RoundMaterial> materials = materialMapper.findByRoundId(roundId);
        for (RoundMaterial m : materials) {
            if ("PPT".equals(m.getMaterialType())) {
                try {
                    String url = m.getUrl();
                    if (url != null && url.startsWith("/uploads/materials/")) {
                        String filename = url.substring("/uploads/materials/".length());
                        Path filePath = Paths.get(uploadPath, filename);
                        Files.deleteIfExists(filePath);
                    }
                } catch (IOException e) {
                    // ignore
                }
            }
        }
        materialMapper.deleteByRoundId(roundId);
    }
}
