package com.example.engTest.service;

import com.example.engTest.config.ApiConfig;
import com.example.engTest.dto.Question;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeminiService {

    private final ApiConfig apiConfig;
    private final ObjectMapper objectMapper;
    private final WebClient.Builder webClientBuilder;

    private static final String UPLOAD_DIR = "uploads/";

    /**
     * AI를 사용하여 영어 문제 자동 생성
     */
    public List<Question> generateQuestions(Long roundId, String prompt, int count, String difficulty,
            String questionType) {
        try {
            String response = callGemini(prompt);
            return parseQuestions(response, roundId, questionType);
        } catch (Exception e) {
            log.error("Failed to generate questions from Gemini", e);
            throw new RuntimeException("문제 생성에 실패했습니다: " + e.getMessage());
        }
    }

    /**
     * 이미지 기반 채점 (Vision API로 손글씨 인식 + 정답 비교)
     */
    /**
     * 이미지 기반 채점 (Vision API로 손글씨 인식 + 정답 비교)
     */
    public GradeResult gradeImageAnswer(MultipartFile image, String promptTemplate, String correctAnswer)
            throws IOException {
        // 이미지 저장
        String imagePath = saveImage(image);

        // 이미지를 Base64로 인코딩
        String base64Image = Base64.getEncoder().encodeToString(image.getBytes());
        String mimeType = image.getContentType() != null ? image.getContentType() : "image/jpeg";

        // Gemini Vision으로 이미지 분석 및 채점
        String prompt = String.format(promptTemplate, correctAnswer);

        try {
            String response = callGeminiWithImage(prompt, base64Image, mimeType);
            return parseGradeResult(response, correctAnswer, imagePath);
        } catch (Exception e) {
            log.error("Failed to grade image answer", e);
            throw new RuntimeException("이미지 채점에 실패했습니다: " + e.getMessage());
        }
    }

    /**
     * 텍스트 기반 채점 (유사도 비교)
     */
    /**
     * 텍스트 기반 채점 (AI 사용 - 철자 엄격, 대소문자/띄어쓰기 무시)
     */
    public GradeResult gradeTextAnswer(String userAnswer, String correctAnswer) {
        if (userAnswer == null || userAnswer.trim().isEmpty()) {
            return new GradeResult(userAnswer, false, "답을 입력하지 않았습니다.", null);
        }

        // 프롬프트 생성
        String prompt = String.format("""
                당신은 영어 시험 채점관입니다.
                다음 사용자의 답안을 정답과 비교하여 채점해주세요.

                정답: "%s"
                사용자 답안: "%s"

                채점 기준:
                1. **철자(Spelling)**: 매우 엄격하게 확인하세요. 틀린 철자가 하나라도 있으면 오답입니다.
                2. **대소문자/띄어쓰기**: 무시하세요. (예: "apple" == "Apple", "bus stop" == "busstop" 은 정답)
                3. **문장부호**: 무시하세요.

                응답 형식 (JSON):
                {
                    "isCorrect": true 또는 false,
                    "feedback": "한글 피드백"
                }

                피드백 가이드:
                - 정답이면: "정답입니다!" (칭찬 문구 추가 가능)
                - 오답이면: 틀린 이유를 구체적으로 한국어로 설명 (예: "철자가 틀렸습니다. 'a'가 빠졌습니다.", "전혀 다른 단어입니다.")
                - 오직 JSON만 응답하세요.
                """, correctAnswer, userAnswer);

        try {
            String response = callGemini(prompt);
            return parseGradeResult(response, correctAnswer, null);
        } catch (Exception e) {
            log.error("AI grading failed, falling back to simple check", e);
            // Fallback: Simple string matching
            String n1 = normalizeText(userAnswer);
            String n2 = normalizeText(correctAnswer);
            boolean simpleCorrect = n1.equals(n2);
            return new GradeResult(userAnswer, simpleCorrect,
                    simpleCorrect ? "정답입니다. (AI 연결 실패로 단순 채점됨)" : "오답입니다. (AI 연결 실패로 단순 채점됨)", null);
        }
    }

    /**
     * 이미지 파일 저장
     */
    public String saveImage(MultipartFile file) throws IOException {
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : ".jpg";

        String filename = UUID.randomUUID() + extension;
        Path filePath = uploadPath.resolve(filename);

        Files.copy(file.getInputStream(), filePath);

        return filePath.toString();
    }

    /**
     * 이미지들에서 영어 단어/문장 추출
     * 모든 이미지를 한 번에 Gemini에 전송하여 번호 매칭이 가능하도록 함
     */
    public List<String> extractWordsFromImages(List<MultipartFile> images, String customPrompt) throws IOException {
        if (images == null || images.isEmpty()) {
            return new ArrayList<>();
        }

        // 모든 이미지를 Base64로 변환
        List<Map<String, Object>> imageParts = new ArrayList<>();
        for (MultipartFile image : images) {
            String base64Image = Base64.getEncoder().encodeToString(image.getBytes());
            String mimeType = image.getContentType() != null ? image.getContentType() : "image/jpeg";

            Map<String, Object> inlineData = new HashMap<>();
            inlineData.put("mimeType", mimeType);
            inlineData.put("data", base64Image);

            Map<String, Object> imagePart = new HashMap<>();
            imagePart.put("inlineData", inlineData);
            imageParts.add(imagePart);
        }

        try {
            // 모든 이미지를 한 번에 전송
            String response = callGeminiWithMultipleImages(customPrompt, imageParts);
            return parseExtractedWords(response);
        } catch (Exception e) {
            log.error("Failed to extract words from images", e);
            throw new RuntimeException("이미지에서 단어를 추출할 수 없습니다: " + e.getMessage());
        }
    }

    /**
     * 추출된 단어로 문제 생성 (난이도별)
     */
    public List<Question> generateQuestionsFromWords(String prompt, Long roundId, String difficulty) {
        try {
            String response = callGemini(prompt);
            return parseQuestionsWithType(response, roundId, difficulty);
        } catch (Exception e) {
            log.error("Failed to generate questions from words", e);
            throw new RuntimeException("문제 생성에 실패했습니다: " + e.getMessage());
        }
    }

    /**
     * 오프라인 답안지 이미지 채점
     */
    public List<OfflineGradeResult> gradeOfflineAnswerSheet(MultipartFile answerSheet, String promptTemplate,
            List<Question> questions)
            throws IOException {
        String base64Image = Base64.getEncoder().encodeToString(answerSheet.getBytes());
        String mimeType = answerSheet.getContentType() != null ? answerSheet.getContentType() : "image/jpeg";

        StringBuilder questionInfo = new StringBuilder();
        for (int i = 0; i < questions.size(); i++) {
            Question q = questions.get(i);
            questionInfo.append(String.format("%d번: 정답=%s\n", i + 1, q.getAnswer()));
        }

        // 프론트엔드에서 받은 템플릿에 문제 정보 주입
        String prompt = String.format(promptTemplate, questionInfo);

        try {
            String response = callGeminiWithImage(prompt, base64Image, mimeType);
            return parseOfflineGradeResults(response);
        } catch (Exception e) {
            log.error("Failed to grade offline answer sheet", e);
            throw new RuntimeException("답안지 채점에 실패했습니다: " + e.getMessage());
        }
    }

    /**
     * 오프라인 답안지 이미지에서 OCR로 답안만 추출 (채점 없음)
     */
    public List<OcrResult> extractAnswersFromImage(MultipartFile answerSheet, int questionCount) throws IOException {
        String base64Image = Base64.getEncoder().encodeToString(answerSheet.getBytes());
        String mimeType = answerSheet.getContentType() != null ? answerSheet.getContentType() : "image/jpeg";

        String prompt = String.format("""
                이 답안지 이미지에서 각 문제 번호에 해당하는 사용자의 답을 읽어주세요.

                총 문제 수: %d문제

                규칙:
                1. 각 문제 번호(1, 2, 3...)에 해당하는 사용자가 적은 답을 그대로 읽어주세요.
                2. 답을 읽을 수 없거나 비어있으면 빈 문자열("")로 표시하세요.
                3. 채점하지 마세요. 단순히 적혀있는 텍스트만 추출하세요.

                응답 형식 (JSON 배열):
                [
                  { "questionNumber": 1, "userAnswer": "읽은 답" },
                  { "questionNumber": 2, "userAnswer": "읽은 답" }
                ]

                오직 JSON만 응답하세요. 다른 설명은 하지 마세요.
                """, questionCount);

        try {
            String response = callGeminiWithImage(prompt, base64Image, mimeType);
            return parseOcrResults(response);
        } catch (Exception e) {
            log.error("Failed to extract answers from image", e);
            throw new RuntimeException("답안 추출에 실패했습니다: " + e.getMessage());
        }
    }

    /**
     * OCR 결과 파싱
     */
    private List<OcrResult> parseOcrResults(String response) throws Exception {
        JsonNode root = objectMapper.readTree(response);
        JsonNode candidates = root.path("candidates");

        if (!candidates.isArray() || candidates.isEmpty()) {
            throw new RuntimeException("Gemini 응답에서 candidates를 찾을 수 없습니다.");
        }

        JsonNode content = candidates.get(0).path("content").path("parts").get(0).path("text");
        String jsonContent = content.asText();

        if (jsonContent.contains("```")) {
            jsonContent = jsonContent.replaceAll("```json\\s*", "").replaceAll("```\\s*", "");
        }

        JsonNode resultsArray = objectMapper.readTree(jsonContent);

        List<OcrResult> results = new ArrayList<>();
        for (JsonNode r : resultsArray) {
            int questionNumber = r.path("questionNumber").asInt();
            String userAnswer = r.path("userAnswer").asText("");
            results.add(new OcrResult(questionNumber, userAnswer));
        }

        return results;
    }

    /**
     * OCR 결과를 담는 레코드
     */
    public record OcrResult(
            int questionNumber,
            String userAnswer) {
    }

    // ========== Private Methods ==========

    /**
     * 단어 목록에 대한 발음기호 생성
     */
    public Map<String, String> generatePhonetics(List<String> words) {
        if (words == null || words.isEmpty()) {
            return new HashMap<>();
        }

        String prompt = """
                당신은 영어 발음 전문가입니다.
                다음 단어들의 **발음기호(IPA)**를 알려주세요.

                단어 목록:
                %s

                응답 형식 (JSON):
                {
                    "word1": "/ipa/",
                    "word2": "/ipa/"
                }

                규칙:
                1. 오직 JSON만 응답하세요.
                2. 표준 미국식 발음 기준입니다.
                3. 모르는 단어는 빈 문자열로 두세요.
                """.formatted(String.join("\n", words));

        try {
            String response = callGemini(prompt);
            return parsePhonetics(response);
        } catch (Exception e) {
            log.error("Failed to generate phonetics", e);
            throw new RuntimeException("발음기호 생성 실패: " + e.getMessage());
        }
    }

    private Map<String, String> parsePhonetics(String response) throws Exception {
        JsonNode root = objectMapper.readTree(response);
        JsonNode candidates = root.path("candidates");

        if (!candidates.isArray() || candidates.isEmpty()) {
            return new HashMap<>();
        }

        JsonNode content = candidates.get(0).path("content").path("parts").get(0).path("text");
        String jsonContent = content.asText();

        if (jsonContent.contains("```")) {
            jsonContent = jsonContent.replaceAll("```json\\s*", "").replaceAll("```\\s*", "");
        }

        JsonNode jsonNode = objectMapper.readTree(jsonContent);
        Map<String, String> result = new HashMap<>();

        Iterator<Map.Entry<String, JsonNode>> fields = jsonNode.fields();
        while (fields.hasNext()) {
            Map.Entry<String, JsonNode> field = fields.next();
            result.put(field.getKey(), field.getValue().asText());
        }

        return result;
    }

    private List<String> parseExtractedWords(String response) throws Exception {
        JsonNode root = objectMapper.readTree(response);
        JsonNode candidates = root.path("candidates");

        if (!candidates.isArray() || candidates.isEmpty()) {
            return new ArrayList<>();
        }

        JsonNode content = candidates.get(0).path("content").path("parts").get(0).path("text");
        String textContent = content.asText();

        // 마크다운 코드 블록 제거 (혹시 모델이 넣었을 경우)
        if (textContent.contains("```")) {
            textContent = textContent.replaceAll("```(\\w+)?", "").replaceAll("```", "");
        }

        List<String> words = new ArrayList<>();
        String[] lines = textContent.split("\\r?\\n");

        for (String line : lines) {
            line = line.trim();
            if (line.isEmpty())
                continue;

            // "영어:한글" 형식 파싱 (콜론이 없는 경우도 일단 추가할지, 아니면 엄격하게 할지 고민)
            // 일단 단순하게 라인 자체를 추가하되, 불필요한 기호(글머리 기호 등)가 있다면 제거
            line = line.replaceAll("^[-*•\\d.]+\\s*", ""); // 글머리 기호 제거

            if (!line.isEmpty()) {
                words.add(line);
            }
        }

        return words;
    }

    private List<Question> parseQuestionsWithType(String response, Long roundId, String difficulty) throws Exception {
        JsonNode root = objectMapper.readTree(response);
        JsonNode candidates = root.path("candidates");

        if (!candidates.isArray() || candidates.isEmpty()) {
            throw new RuntimeException("Gemini 응답에서 candidates를 찾을 수 없습니다.");
        }

        JsonNode content = candidates.get(0).path("content").path("parts").get(0).path("text");
        String jsonContent = content.asText();

        if (jsonContent.contains("```")) {
            jsonContent = jsonContent.replaceAll("```json\\s*", "").replaceAll("```\\s*", "");
        }

        JsonNode questionsArray = objectMapper.readTree(jsonContent);

        List<Question> questions = new ArrayList<>();
        int seqNo = 1;

        for (JsonNode q : questionsArray) {
            String questionText = q.path("questionText").asText();
            String answer = q.path("answer").asText();
            String answerType = q.path("answerType").asText("CHOICE");

            JsonNode optionsNode = q.path("options");
            List<String> options = new ArrayList<>();
            for (JsonNode opt : optionsNode) {
                options.add(opt.asText());
            }

            // 객관식이면 정답 포함하여 셔플
            if ("CHOICE".equals(answerType) && !options.isEmpty()) {
                options.add(answer);
                Collections.shuffle(options);
            }

            Question question = Question.builder()
                    .roundId(roundId)
                    .questionType(difficulty)
                    .answerType(answerType)
                    .questionText(questionText)
                    .answer(answer)
                    .option1(options.size() > 0 ? options.get(0) : null)
                    .option2(options.size() > 1 ? options.get(1) : null)
                    .option3(options.size() > 2 ? options.get(2) : null)
                    .option4(options.size() > 3 ? options.get(3) : null)
                    .seqNo(seqNo++)
                    .build();

            questions.add(question);
        }

        return questions;
    }

    private List<OfflineGradeResult> parseOfflineGradeResults(String response) throws Exception {
        JsonNode root = objectMapper.readTree(response);
        JsonNode candidates = root.path("candidates");

        if (!candidates.isArray() || candidates.isEmpty()) {
            throw new RuntimeException("Gemini 응답에서 candidates를 찾을 수 없습니다.");
        }

        JsonNode content = candidates.get(0).path("content").path("parts").get(0).path("text");
        String jsonContent = content.asText();

        if (jsonContent.contains("```")) {
            jsonContent = jsonContent.replaceAll("```json\\s*", "").replaceAll("```\\s*", "");
        }

        JsonNode resultsArray = objectMapper.readTree(jsonContent);

        List<OfflineGradeResult> results = new ArrayList<>();
        for (JsonNode r : resultsArray) {
            int questionNumber = r.path("questionNumber").asInt();
            String userAnswer = r.path("userAnswer").asText("");
            boolean isCorrect = r.path("isCorrect").asBoolean(false);
            String feedback = r.path("feedback").asText("");

            results.add(new OfflineGradeResult(questionNumber, userAnswer, isCorrect, feedback));
        }

        return results;
    }

    // ========== Original Private Methods ==========

    private String callGemini(String prompt) {
        String apiKey = apiConfig.getGemini().getKey();
        String model = apiConfig.getGemini().getModel();
        String baseUrl = apiConfig.getGemini().getUrl();

        if (apiKey == null || apiKey.isEmpty()) {
            throw new RuntimeException("Gemini API 키가 설정되지 않았습니다.");
        }

        String url = String.format("%s/%s:generateContent?key=%s", baseUrl, model, apiKey);

        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt);

        Map<String, Object> content = new HashMap<>();
        content.put("parts", List.of(textPart));

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", List.of(content));

        WebClient webClient = webClientBuilder.build();

        String response = webClient.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        log.debug("Gemini response: {}", response);
        return response;
    }

    private String callGeminiWithImage(String prompt, String base64Image, String mimeType) {
        String apiKey = apiConfig.getGemini().getKey();
        String model = apiConfig.getGemini().getModel();
        String baseUrl = apiConfig.getGemini().getUrl();

        if (apiKey == null || apiKey.isEmpty()) {
            throw new RuntimeException("Gemini API 키가 설정되지 않았습니다.");
        }

        String url = String.format("%s/%s:generateContent?key=%s", baseUrl, model, apiKey);

        // 텍스트 파트
        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt);

        // 이미지 파트
        Map<String, Object> inlineData = new HashMap<>();
        inlineData.put("mimeType", mimeType);
        inlineData.put("data", base64Image);

        Map<String, Object> imagePart = new HashMap<>();
        imagePart.put("inlineData", inlineData);

        Map<String, Object> content = new HashMap<>();
        content.put("parts", List.of(textPart, imagePart));

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", List.of(content));

        WebClient webClient = webClientBuilder.build();

        String response = webClient.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(),
                        clientResponse -> clientResponse.bodyToMono(String.class)
                                .doOnNext(errorBody -> log.error("Gemini API error response: {}", errorBody))
                                .flatMap(errorBody -> reactor.core.publisher.Mono.error(
                                        new RuntimeException("Gemini API error: " + errorBody))))
                .bodyToMono(String.class)
                .block();

        log.debug("Gemini Vision response: {}", response);
        return response;
    }

    /**
     * 여러 이미지를 한 번에 Gemini에 전송 (번호 매칭을 위해)
     */
    private String callGeminiWithMultipleImages(String prompt, List<Map<String, Object>> imageParts) {
        String apiKey = apiConfig.getGemini().getKey();
        String model = apiConfig.getGemini().getModel();
        String baseUrl = apiConfig.getGemini().getUrl();

        if (apiKey == null || apiKey.isEmpty()) {
            throw new RuntimeException("Gemini API 키가 설정되지 않았습니다.");
        }

        String url = String.format("%s/%s:generateContent?key=%s", baseUrl, model, apiKey);

        // 텍스트 파트
        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt);

        // parts 리스트 구성: 텍스트 + 모든 이미지들
        List<Map<String, Object>> parts = new ArrayList<>();
        parts.add(textPart);
        parts.addAll(imageParts);

        Map<String, Object> content = new HashMap<>();
        content.put("parts", parts);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", List.of(content));

        WebClient webClient = webClientBuilder.build();

        String response = webClient.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(),
                        clientResponse -> clientResponse.bodyToMono(String.class)
                                .doOnNext(errorBody -> log.error("Gemini API error response: {}", errorBody))
                                .flatMap(errorBody -> reactor.core.publisher.Mono.error(
                                        new RuntimeException("Gemini API error: " + errorBody))))
                .bodyToMono(String.class)
                .block();

        log.debug("Gemini Multi-Image response: {}", response);
        return response;
    }

    private List<Question> parseQuestions(String response, Long roundId, String questionType) throws Exception {
        JsonNode root = objectMapper.readTree(response);
        JsonNode candidates = root.path("candidates");

        if (!candidates.isArray() || candidates.isEmpty()) {
            throw new RuntimeException("Gemini 응답에서 candidates를 찾을 수 없습니다.");
        }

        JsonNode content = candidates.get(0).path("content").path("parts").get(0).path("text");
        String jsonContent = content.asText();

        // JSON 배열 추출 (마크다운 코드 블록 제거)
        if (jsonContent.contains("```")) {
            jsonContent = jsonContent.replaceAll("```json\\s*", "").replaceAll("```\\s*", "");
        }

        JsonNode questionsArray = objectMapper.readTree(jsonContent);

        List<Question> questions = new ArrayList<>();
        int seqNo = 1;

        for (JsonNode q : questionsArray) {
            String questionText = q.path("questionText").asText();
            String answer = q.path("answer").asText();

            JsonNode optionsNode = q.path("options");
            List<String> options = new ArrayList<>();
            for (JsonNode opt : optionsNode) {
                options.add(opt.asText());
            }

            // 정답을 포함하여 4개 보기 만들기 (셔플)
            options.add(answer);
            Collections.shuffle(options);

            Question question = Question.builder()
                    .roundId(roundId)
                    .questionType(questionType)
                    .questionText(questionText)
                    .answer(answer)
                    .option1(options.size() > 0 ? options.get(0) : null)
                    .option2(options.size() > 1 ? options.get(1) : null)
                    .option3(options.size() > 2 ? options.get(2) : null)
                    .option4(options.size() > 3 ? options.get(3) : null)
                    .seqNo(seqNo++)
                    .build();

            questions.add(question);
        }

        return questions;
    }

    private GradeResult parseGradeResult(String response, String correctAnswer, String imagePath) throws Exception {
        JsonNode root = objectMapper.readTree(response);
        JsonNode candidates = root.path("candidates");

        if (!candidates.isArray() || candidates.isEmpty()) {
            throw new RuntimeException("Gemini 응답에서 candidates를 찾을 수 없습니다.");
        }

        JsonNode content = candidates.get(0).path("content").path("parts").get(0).path("text");
        String jsonContent = content.asText();

        // JSON 추출 (마크다운 코드 블록 제거)
        if (jsonContent.contains("```")) {
            jsonContent = jsonContent.replaceAll("```json\\s*", "").replaceAll("```\\s*", "");
        }

        JsonNode result = objectMapper.readTree(jsonContent);

        String extractedText = result.path("extractedText").asText("");
        boolean isCorrect = result.path("isCorrect").asBoolean(false);
        String feedback = result.path("feedback").asText("");

        return new GradeResult(extractedText, isCorrect, feedback, imagePath);
    }

    private String normalizeText(String text) {
        return text.toLowerCase()
                .replaceAll("[^a-z0-9\\s]", "")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private double calculateSimilarity(String s1, String s2) {
        int maxLength = Math.max(s1.length(), s2.length());
        if (maxLength == 0) {
            return 1.0;
        }
        int distance = levenshteinDistance(s1, s2);
        return 1.0 - ((double) distance / maxLength);
    }

    private int levenshteinDistance(String s1, String s2) {
        int[][] dp = new int[s1.length() + 1][s2.length() + 1];

        for (int i = 0; i <= s1.length(); i++) {
            for (int j = 0; j <= s2.length(); j++) {
                if (i == 0) {
                    dp[i][j] = j;
                } else if (j == 0) {
                    dp[i][j] = i;
                } else {
                    int cost = s1.charAt(i - 1) == s2.charAt(j - 1) ? 0 : 1;
                    dp[i][j] = Math.min(
                            Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1),
                            dp[i - 1][j - 1] + cost);
                }
            }
        }

        return dp[s1.length()][s2.length()];
    }

    // ========== Inner Classes ==========

    /**
     * 채점 결과를 담는 레코드
     */
    public record GradeResult(
            String extractedText,
            boolean isCorrect,
            String feedback,
            String imagePath) {
    }

    /**
     * 오프라인 채점 결과를 담는 레코드
     */
    public record OfflineGradeResult(
            int questionNumber,
            String userAnswer,
            boolean isCorrect,
            String feedback) {
    }
}
