# Backend Cleanup TODO

## 1. [HIGH] WebConfig 중복 충돌

**파일:**
- `src/main/java/com/example/engTest/config/WebConfig.java`
- `src/main/java/com/example/engTest/config/WebMvcConfig.java`

**문제:** 둘 다 `WebMvcConfigurer` 구현하며 `/uploads/**` 리소스 핸들러 중복 등록. Spring이 어떤 걸 쓸지 예측 불가.

**수정:** 하나로 합치거나 하나 삭제. WebMvcConfig이 더 정교함(절대경로 + URI 변환).

---

## 2. [HIGH] ExamController.getActiveExams() 이름-동작 불일치

**파일:** `src/main/java/com/example/engTest/controller/ExamController.java`

**문제:** `@GetMapping("/active")` + `getActiveExams()`인데 실제로 `examService.getAllExams()` 호출. 이름과 동작이 다름.

**수정:** 메서드명/엔드포인트 수정 또는 실제로 active만 필터링하도록 변경.

---

## 3. [MEDIUM] getClientIp() 중복

**파일:**
- `src/main/java/com/example/engTest/config/ActivityLoggingAspect.java` (203-221줄)
- `src/main/java/com/example/engTest/controller/LogController.java` (133-145줄)

**문제:** 거의 동일한 코드가 두 곳에 존재.

**수정:** `RequestUtils.java` 유틸 클래스로 추출.

---

## 4. [MEDIUM] 미사용 메서드 삭제 (grep 검증 완료)

### UserService.java
- `getUserByName()` - 호출 0회
- `createUser()` - 호출 0회 (getOrCreateUser만 사용)
- `updateUser()` - 호출 0회
- `deleteUser()` - 호출 0회

### QuestionService.java
- `updateQuestion()` - 호출 0회
- `deleteQuestion()` - 호출 0회 (deleteQuestionsByRoundId만 사용)

### ExamService.java
- `getCompletedExamsByRoundId()` - 호출 0회

### GeminiService.java
- `calculateSimilarity()` - 호출 0회
- `levenshteinDistance()` - calculateSimilarity에서만 호출되나 그것도 미사용
- **주의: `normalizeText()`는 삭제하면 안 됨!** AI 채점 실패 시 fallback에서 사용 중 (114-115줄)

### ExamMapper.java + ExamMapper.xml
- `updateScore()` - examMapper.updateScore 호출 0회
- `updateStatus()` - examMapper.updateStatus 호출 0회 (roundMapper.updateStatus는 사용 중이니 혼동 주의)

### VocabularyMapper.java + VocabularyMapper.xml
- `update()` - 호출 0회

### QuestionMapper.java + QuestionMapper.xml
- `update()` - updateQuestion()에서만 호출되는데 그것도 미사용

---

## 5. [LOW] ExamService 모순/중복 주석 정리

**파일:** `src/main/java/com/example/engTest/service/ExamService.java` (142-155줄)

**문제:** "RESUME" 주석이 2번 반복되고 서로 모순, "[CHANGED]" 주석은 git history로 충분.

---

## 6. [LOW] 코드 스타일 통일

- import 와일드카드(`*`) 사용 불일치 (ExamService, GeminiService에서 사용)
- 컨트롤러 에러 응답 패턴 불일치 (Map.of vs .build() vs 예외 throw 혼용)
