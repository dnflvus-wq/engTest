package com.example.engTest.service;

import com.example.engTest.config.ApiConfig;
import com.example.engTest.dto.Question;
import com.example.engTest.mapper.QuestionMapper;
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
import java.util.ArrayList;
import java.util.Base64;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeminiService {

    private final ApiConfig apiConfig;
    private final ObjectMapper objectMapper;
    private final WebClient.Builder webClientBuilder;
    private final QuestionMapper questionMapper;

    private static final String UPLOAD_DIR = "uploads/";

    // ========== Public API Methods ==========

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
    public GradeResult gradeImageAnswer(MultipartFile image, String promptTemplate, String correctAnswer)
            throws IOException {
        String imagePath = saveImage(image);
        String base64Image = Base64.getEncoder().encodeToString(image.getBytes());
        String mimeType = image.getContentType() != null ? image.getContentType() : "image/jpeg";
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
     * 텍스트 기반 채점 (AI 사용 - 철자 엄격, 대소문자/띄어쓰기 무시)
     */
    public GradeResult gradeTextAnswer(String userAnswer, String correctAnswer, String altAnswers) {
        if (userAnswer == null || userAnswer.trim().isEmpty()) {
            return new GradeResult(userAnswer, false, "답을 입력하지 않았습니다.", null);
        }

        String altAnswerLine = (altAnswers != null && !altAnswers.isBlank())
                ? "\n                대체 정답(이것도 정답으로 인정): \"" + altAnswers.replace("|", "\", \"") + "\""
                : "";

        String prompt = String.format("""
                당신은 영어 시험 채점관입니다.
                다음 사용자의 답안을 정답과 비교하여 채점해주세요.

                정답: "%s"%s
                사용자 답안: "%s"

                채점 기준:
                1. **철자(Spelling)**: 매우 엄격하게 확인하세요. 틀린 철자가 하나라도 있으면 오답입니다.
                2. **대소문자/띄어쓰기**: 무시하세요. (예: "apple" == "Apple", "bus stop" == "busstop" 은 정답)
                3. **문장부호**: 무시하세요.
                4. **대체 정답**: 위에 대체 정답이 있으면 그것도 정답으로 인정합니다.

                응답 형식 (JSON):
                {
                    "isCorrect": true 또는 false,
                    "feedback": "한글 피드백"
                }

                피드백 가이드:
                - 정답이면: "정답입니다!" (칭찬 문구 추가 가능)
                - 오답이면: 틀린 이유를 구체적으로 한국어로 설명 (예: "철자가 틀렸습니다. 'a'가 빠졌습니다.", "전혀 다른 단어입니다.")
                - 오직 JSON만 응답하세요.
                """, correctAnswer, altAnswerLine, userAnswer);

        try {
            String response = callGemini(prompt);
            return parseGradeResult(response, correctAnswer, null);
        } catch (Exception e) {
            log.error("AI grading failed, falling back to simple check", e);
            String n1 = normalizeText(userAnswer);
            boolean simpleCorrect = n1.equals(normalizeText(correctAnswer));
            if (!simpleCorrect && altAnswers != null && !altAnswers.isBlank()) {
                for (String alt : altAnswers.split("\\|")) {
                    if (n1.equals(normalizeText(alt.trim()))) { simpleCorrect = true; break; }
                }
            }
            return new GradeResult(userAnswer, simpleCorrect,
                    simpleCorrect ? "정답입니다. (AI 연결 실패로 단순 채점됨)" : "오답입니다. (AI 연결 실패로 단순 채점됨)", null);
        }
    }

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
     */
    public List<String> extractWordsFromImages(List<MultipartFile> images, String customPrompt) throws IOException {
        if (images == null || images.isEmpty()) {
            return new ArrayList<>();
        }

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
     * 오프라인 답안지 이미지에서 OCR로 답안만 추출
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

    // ========== Gemini Response Parsing Helpers ==========

    /**
     * Gemini 응답에서 텍스트 콘텐츠를 추출하고 마크다운 코드블록을 제거하여 JSON 문자열 반환
     */
    private String extractJsonFromResponse(String response) throws Exception {
        JsonNode root = objectMapper.readTree(response);
        JsonNode candidates = root.path("candidates");
        if (!candidates.isArray() || candidates.isEmpty()) {
            throw new RuntimeException("Gemini 응답에서 candidates를 찾을 수 없습니다.");
        }
        String text = candidates.get(0).path("content").path("parts").get(0).path("text").asText();
        if (text.contains("```")) {
            text = text.replaceAll("```json\\s*", "").replaceAll("```\\s*", "");
        }
        return text;
    }

    /**
     * Gemini 응답에서 텍스트 콘텐츠만 추출 (JSON 파싱 불필요한 경우)
     */
    private String extractTextFromResponse(String response) throws Exception {
        JsonNode root = objectMapper.readTree(response);
        JsonNode candidates = root.path("candidates");
        if (!candidates.isArray() || candidates.isEmpty()) {
            return null;
        }
        return candidates.get(0).path("content").path("parts").get(0).path("text").asText();
    }

    private List<OcrResult> parseOcrResults(String response) throws Exception {
        String jsonContent = extractJsonFromResponse(response);
        JsonNode resultsArray = objectMapper.readTree(jsonContent);

        List<OcrResult> results = new ArrayList<>();
        for (JsonNode r : resultsArray) {
            results.add(new OcrResult(r.path("questionNumber").asInt(), r.path("userAnswer").asText("")));
        }
        return results;
    }

    private Map<String, String> parsePhonetics(String response) throws Exception {
        String text = extractTextFromResponse(response);
        if (text == null) return new HashMap<>();

        if (text.contains("```")) {
            text = text.replaceAll("```json\\s*", "").replaceAll("```\\s*", "");
        }

        JsonNode jsonNode = objectMapper.readTree(text);
        Map<String, String> result = new HashMap<>();
        Iterator<Map.Entry<String, JsonNode>> fields = jsonNode.fields();
        while (fields.hasNext()) {
            Map.Entry<String, JsonNode> field = fields.next();
            result.put(field.getKey(), field.getValue().asText());
        }
        return result;
    }

    private List<String> parseExtractedWords(String response) throws Exception {
        String textContent = extractTextFromResponse(response);
        if (textContent == null) return new ArrayList<>();

        if (textContent.contains("```")) {
            textContent = textContent.replaceAll("```(\\w+)?", "").replaceAll("```", "");
        }

        List<String> words = new ArrayList<>();
        String[] lines = textContent.split("\\r?\\n");

        for (String line : lines) {
            line = line.trim();
            if (line.isEmpty()) continue;
            line = line.replaceAll("^[-*•\\d.]+\\s*", "");
            if (!line.isEmpty()) {
                words.add(line);
            }
        }
        return words;
    }

    private List<Question> parseQuestionsWithType(String response, Long roundId, String difficulty) throws Exception {
        String jsonContent = extractJsonFromResponse(response);
        JsonNode questionsArray = objectMapper.readTree(jsonContent);

        List<Question> questions = new ArrayList<>();
        int seqNo = questionMapper.getMaxSeqNo(roundId) + 1;

        for (JsonNode q : questionsArray) {
            String questionText = q.path("questionText").asText();
            String answer = q.path("answer").asText();
            String answerType = q.path("answerType").asText("CHOICE");

            JsonNode optionsNode = q.path("options");
            List<String> options = new ArrayList<>();
            for (JsonNode opt : optionsNode) {
                options.add(opt.asText());
            }

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
        String jsonContent = extractJsonFromResponse(response);
        JsonNode resultsArray = objectMapper.readTree(jsonContent);

        List<OfflineGradeResult> results = new ArrayList<>();
        for (JsonNode r : resultsArray) {
            results.add(new OfflineGradeResult(
                    r.path("questionNumber").asInt(),
                    r.path("userAnswer").asText(""),
                    r.path("isCorrect").asBoolean(false),
                    r.path("feedback").asText("")));
        }
        return results;
    }

    private List<Question> parseQuestions(String response, Long roundId, String questionType) throws Exception {
        String jsonContent = extractJsonFromResponse(response);
        JsonNode questionsArray = objectMapper.readTree(jsonContent);

        List<Question> questions = new ArrayList<>();
        int seqNo = questionMapper.getMaxSeqNo(roundId) + 1;

        for (JsonNode q : questionsArray) {
            String questionText = q.path("questionText").asText();
            String answer = q.path("answer").asText();

            JsonNode optionsNode = q.path("options");
            List<String> options = new ArrayList<>();
            for (JsonNode opt : optionsNode) {
                options.add(opt.asText());
            }

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
        String jsonContent = extractJsonFromResponse(response);
        JsonNode result = objectMapper.readTree(jsonContent);

        String extractedText = result.path("extractedText").asText("");
        boolean isCorrect = result.path("isCorrect").asBoolean(false);
        String feedback = result.path("feedback").asText("");

        return new GradeResult(extractedText, isCorrect, feedback, imagePath);
    }

    // ========== Gemini API Call Methods ==========

    private String getGeminiApiUrl() {
        String apiKey = apiConfig.getGemini().getKey();
        if (apiKey == null || apiKey.isEmpty()) {
            throw new RuntimeException("Gemini API 키가 설정되지 않았습니다.");
        }
        String model = apiConfig.getGemini().getModel();
        String baseUrl = apiConfig.getGemini().getUrl();
        return String.format("%s/%s:generateContent?key=%s", baseUrl, model, apiKey);
    }

    private String callGemini(String prompt) {
        String url = getGeminiApiUrl();

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
        String url = getGeminiApiUrl();

        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt);

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

    private String callGeminiWithMultipleImages(String prompt, List<Map<String, Object>> imageParts) {
        String url = getGeminiApiUrl();

        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt);

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

    private String normalizeText(String text) {
        return text.toLowerCase()
                .replaceAll("[^a-z0-9\\s]", "")
                .replaceAll("\\s+", " ")
                .trim();
    }

    // ========== Inner Classes ==========

    public record GradeResult(
            String extractedText,
            boolean isCorrect,
            String feedback,
            String imagePath) {
    }

    public record OfflineGradeResult(
            int questionNumber,
            String userAnswer,
            boolean isCorrect,
            String feedback) {
    }

    public record OcrResult(
            int questionNumber,
            String userAnswer) {
    }
}
