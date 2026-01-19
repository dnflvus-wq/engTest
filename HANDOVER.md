# 📋 영어 시험 시스템 - 인수인계서

## 프로젝트 개요

**이름:** engTest (영어 시험 시스템)

**목적:** 웹 기반 영어 시험 플랫폼으로 AI가 자동으로 문제를 생성하고, 손글씨를 OCR로 인식하여 자동 채점하는 시스템

**개발 완료 상태:** 전체 기능 구현 완료, 빌드 성공 ✅

---

## 기술 스택

| 항목 | 기술 |
|------|------|
| **백엔드** | Spring Boot 4.0.1 (Java 21) |
| **ORM/SQL** | MyBatis 4.0.1 |
| **데이터베이스** | MariaDB 10.11 |
| **AI 문제 생성** | Google Gemini API (gemini-2.0-flash) |
| **OCR (손글씨 인식)** | Google Cloud Vision API 또는 Naver Clova OCR |
| **빌드 도구** | Gradle 9.2.1 |
| **컨테이너화** | Docker & Docker Compose |
| **프론트엔드** | 순수 HTML/CSS/JavaScript |

---

## 프로젝트 구조

```
engTest/
├── src/main/java/com/example/engTest/
│   ├── config/
│   │   ├── ApiConfig.java              # API 설정 바인딩 (@ConfigurationProperties)
│   │   └── WebConfig.java              # CORS 설정
│   │
│   ├── controller/
│   │   ├── UserController.java         # 사용자 로그인/통계
│   │   ├── RoundController.java        # 회차/문제 관리 + AI 생성
│   │   ├── ExamController.java         # 시험 응시/채점/OCR
│   │   └── StatsController.java        # 전체 통계
│   │
│   ├── service/
│   │   ├── UserService.java
│   │   ├── RoundService.java
│   │   ├── QuestionService.java
│   │   ├── ExamService.java            # 점수 계산, 시험 상태 관리
│   │   └── GeminiService.java          # AI 문제 생성 + OCR 채점
│   │
│   ├── mapper/                         # MyBatis 인터페이스
│   │   ├── UserMapper.java
│   │   ├── RoundMapper.java
│   │   ├── QuestionMapper.java
│   │   ├── ExamMapper.java
│   │   └── ExamAnswerMapper.java
│   │
│   └── dto/                            # 데이터 클래스
│       ├── User.java
│       ├── Round.java
│       ├── Question.java
│       ├── Exam.java
│       ├── ExamAnswer.java
│       ├── RoundStats.java
│       └── UserStats.java
│
├── src/main/resources/
│   ├── static/
│   │   ├── index.html                  # 단일 페이지 애플리케이션
│   │   ├── css/style.css               # 반응형 디자인
│   │   └── js/app.js                   # 모든 상호작용 로직
│   │
│   ├── mapper/                         # MyBatis XML
│   │   ├── UserMapper.xml
│   │   ├── RoundMapper.xml
│   │   ├── QuestionMapper.xml
│   │   ├── ExamMapper.xml
│   │   └── ExamAnswerMapper.xml
│   │
│   ├── sql/
│   │   └── schema.sql                  # DB 초기화 스크립트
│   │
│   └── application.yaml                # Spring 설정
│
├── Dockerfile                          # 멀티스테이지 빌드
├── docker-compose.yml                  # Spring Boot + MariaDB
├── .env.example                        # 환경 변수 템플릿
├── build.gradle                        # Gradle 설정
└── settings.gradle
```

---

## 빌드 상태

✅ **빌드 성공:** `engTest-0.0.1-SNAPSHOT.jar` (46MB)

```bash
# 빌드 명령어
./gradlew build -x test --no-daemon

# 빌드된 JAR
build/libs/engTest-0.0.1-SNAPSHOT.jar
```

---

## 설치 및 실행 방법

### 1. 환경 변수 설정

```bash
# .env 파일 생성
cp .env.example .env

# .env 파일에 다음 입력
GEMINI_API_KEY=your-gemini-api-key-here
DB_HOST=localhost
DB_PORT=3306
DB_NAME=engtest
DB_USER=root
DB_PASSWORD=root123!
```

### 2. Docker Compose로 실행

```bash
cd /c/Project/engTest

# 서비스 시작
docker-compose up -d

# 로그 확인
docker-compose logs -f app

# 서비스 종료
docker-compose down
```

### 3. 접속

```
http://localhost:8080
```

### 4. 로컬 개발 (Docker 없이)

MariaDB가 로컬에 설치되어 있다면:

```bash
java -jar build/libs/engTest-0.0.1-SNAPSHOT.jar \
  --spring.datasource.url=jdbc:mariadb://localhost:3306/engtest \
  --spring.datasource.username=root \
  --spring.datasource.password=root \
  --OPENAI_API_KEY=your-key
```

---

## 주요 기능

### 1. 사용자 관리
- **로그인:** 이름만 입력 (자동 회원 생성)
- **통계:** 사용자별 순위, 평균 점수, 응시 횟수

### 2. 회차 관리 (관리자)
- **새 회차 생성:** 제목, 설명, 문제 수, 난이도, 유형
- **AI 문제 생성:** Gemini API로 자동 생성
  - 난이도: EASY, MEDIUM, HARD
  - 유형: WORD (단어), SENTENCE (문장), MIXED (혼합)
- **활성/비활성 상태 관리**
- **문제 재생성 가능**

### 3. 시험 응시
- **객관식:** 4지선다형 객관식 (자동 채점)
- **주관식 (손글씨):**
  - 사진 업로드
  - Google Vision 또는 Clova OCR로 텍스트 인식
  - 텍스트 정규화 후 유사도 80% 이상이면 정답 처리
- **Levenshtein distance** 기반 유사도 계산

### 4. 채점 및 결과
- **자동 채점:** 제출 시 즉시 점수 계산
- **점수 계산:** (정답 수 / 전체 문제) × 100
- **오답 노트:** 틀린 문제만 따로 확인

### 5. 통계
- **사용자 순위:** 평균 점수 기반
- **회차별 통계:** 평균, 최고/최저 점수, 응시자 수

---

## API 엔드포인트

### 사용자
```
POST   /api/users/login           # 로그인/회원가입
GET    /api/users                 # 전체 사용자 목록
GET    /api/users/{id}            # 특정 사용자 조회
GET    /api/users/stats           # 사용자 통계 (순위)
GET    /api/users/{id}/stats      # 특정 사용자 통계
```

### 회차/문제
```
GET    /api/rounds                # 전체 회차
GET    /api/rounds/active         # 활성 회차만
GET    /api/rounds/{id}           # 특정 회차
POST   /api/rounds                # 회차 생성
POST   /api/rounds/{id}/generate  # AI로 문제 생성
GET    /api/rounds/{id}/questions # 회차 문제 조회
PUT    /api/rounds/{id}           # 회차 수정
PUT    /api/rounds/{id}/status    # 회차 상태 변경
DELETE /api/rounds/{id}           # 회차 삭제
```

### 시험
```
POST   /api/exams/start                        # 시험 시작
POST   /api/exams/{id}/answer/{qId}            # 이미지 업로드/OCR
POST   /api/exams/{id}/answer/{qId}/text       # 텍스트 답안 제출
POST   /api/exams/{id}/submit                  # 시험 제출
GET    /api/exams                              # 전체 시험 기록
GET    /api/exams/{id}                         # 특정 시험 조회
GET    /api/exams/user/{userId}                # 사용자 시험 기록
GET    /api/exams/{id}/answers                 # 시험 답안 조회
GET    /api/exams/{id}/wrong-answers           # 오답만 조회
GET    /api/exams/ranking/{roundId}            # 회차 순위
```

### 통계
```
GET    /api/stats                 # 전체 대시보드
GET    /api/stats/users           # 사용자 순위
GET    /api/stats/rounds          # 회차별 통계
GET    /api/stats/users/{id}      # 특정 사용자 통계
GET    /api/stats/rounds/{id}     # 특정 회차 통계
```

---

## 데이터베이스 스키마

### 테이블 구조

**users**
```sql
id (PK), name, created_at
```

**rounds**
```sql
id (PK), title, description, question_count, difficulty, status, created_at
```

**questions**
```sql
id (PK), round_id (FK), question_type, question_text, answer,
option1-4, hint, seq_no, created_at
```

**exams**
```sql
id (PK), user_id (FK), round_id (FK), total_count, correct_count,
score, status, started_at, submitted_at
```

**exam_answers**
```sql
id (PK), exam_id (FK), question_id (FK), user_answer, is_correct,
ocr_raw_text, image_path, created_at
```

### 뷰

**v_round_stats**
- 회차별 응시 통계 (평균, 최고/최저 점수)

**v_user_stats**
- 사용자별 통계 (순위, 평균 점수)

---

## 설정 파일

### application.yaml

```yaml
# DB 연결 (환경 변수로 주입)
spring.datasource.url=jdbc:mariadb://${DB_HOST}:${DB_PORT}/${DB_NAME}
spring.datasource.username=${DB_USER}
spring.datasource.password=${DB_PASSWORD}

# MyBatis
mybatis.mapper-locations=classpath:/mapper/**/*.xml
mybatis.type-aliases-package=com.example.engTest.dto
mybatis.configuration.map-underscore-to-camel-case=true

# API 설정 (환경 변수)
api.gemini.key=${GEMINI_API_KEY}
api.gemini.model=gemini-2.0-flash
api.gemini.url=https://generativelanguage.googleapis.com/v1beta/models
```

---

## 주요 코드 로직

### 1. AI 문제 생성 (GeminiService.java)

```java
- prompt 생성 (난이도, 유형 반영)
- Gemini API 호출
- JSON 응답 파싱
- Question 객체로 변환 (보기 셔플)
- DB 저장
```

### 2. OCR 및 자동 채점 (GeminiService.java)

```java
- 이미지 Base64 인코딩
- Gemini Vision API 호출 (손글씨 인식 + 채점 동시 수행)
- JSON 응답 파싱 (extractedText, isCorrect, feedback)
- 텍스트 채점은 정규화 + Levenshtein distance 기반
- 80% 이상 유사하면 정답 처리
```

### 3. 시험 점수 계산 (ExamService.java:L90-110)

```java
- 정답 개수 카운트
- 점수 = (정답 수 / 전체) × 100 (소수점 2자리)
- 시험 상태를 COMPLETED로 변경
- submitted_at 기록
```

---

## 프론트엔드 (app.js)

### 상태 관리
```javascript
currentUser          # 로그인한 사용자
currentExam          # 진행 중인 시험
currentQuestions     # 현재 시험의 문제들
currentQuestionIndex # 현재 문제 인덱스
userAnswers          # 문제별 답안 저장
```

### 주요 함수
```javascript
login()              # 로그인/회원가입
startExam()          # 시험 시작
renderQuestion()     # 문제 화면 렌더링
uploadAnswer()       # 이미지 업로드 + OCR
submitExam()         # 시험 제출
showStats()          # 통계 화면
showAdmin()          # 관리자 화면
```

---

## 알려진 제한사항

1. **OCR 정확도:**
   - 손글씨가 명확해야 인식 잘 됨
   - 정규화 후 80% 유사도 기준 (조정 가능)

2. **API 비용:**
   - Gemini API: 무료 티어 제공 (분당 15 요청)
   - 유료 시 문제 생성당 약 $0.001 수준

3. **브라우저:**
   - Chrome, Firefox, Safari 등 최신 브라우저 권장
   - IE 미지원

4. **동시성:**
   - 대규모 동시 사용자 처리는 추가 최적화 필요

---

## 2026-01-19 작업 내역

### 1. 로그인/세션 기능 구현 ✅
- **세션 쿠키 설정** (application.yaml)
  - `session.timeout: 0` (무제한)
  - `cookie.max-age: 2147483647` (약 68년 유지)
- **UserController 수정**
  - `POST /api/users/login` - 세션에 userId 저장
  - `POST /api/users/logout` - 세션 무효화
  - `GET /api/users/me` - 현재 로그인 사용자 조회
- **프론트엔드 (app.js)**
  - `checkSession()` - 페이지 로드 시 자동 로그인 체크
  - `logout()` - 서버 로그아웃 호출 추가

### 2. Admin 페이지 레이아웃 수정 ✅
- 사이드바 구조를 index.html과 동일하게 통일
- Admin 페이지에서 Admin 메뉴가 active 상태

### 3. 회차 생성 흐름 개선 ✅
- **기존**: 회차 생성 시 이미지 업로드 → 단어 추출 → 문제 생성 (3단계)
- **변경**: 회차 생성 (제목/설명만) → 상세 페이지에서 단어 입력/문제 생성

### 4. 단어 입력 탭 신규 구성 ✅
- "문제 목록" → "단어 입력" 탭으로 변경
- 2단 그리드 레이아웃 (수동 입력 | 이미지 추출)
- 난이도 선택을 문제 생성 영역으로 이동
- 단어 저장: `List<String>` 형식 (`["apple:사과", ...]`)

### 5. CSS 추가 ✅
- `.two-column-grid` - 2단 그리드 (모바일 1단)
- `.vocab-table`, `.vocab-row` - 단어 목록 테이블

---

## 추가 개발 사항

### 우선순위 높음
- [x] 사용자 인증 (로그인/세션) ✅ 완료
- [ ] 문제 수동 등록 기능
- [ ] 시험 시간 제한 기능
- [ ] 문제 미리보기 기능

### 우선순위 중간
- [ ] 연도/월별 통계 그래프
- [ ] 개인 오답 통계
- [ ] 문제 난이도 조정 후 재생성
- [ ] 엑셀 다운로드 기능

### 우선순위 낮음
- [ ] 모바일 앱 (React Native)
- [ ] 다국어 지원
- [ ] 음성 출제 기능
- [ ] 라이브 그룹 시험

---

## 트러블슈팅

### Docker 실행 안 될 때
```bash
# 기존 컨테이너 정리
docker-compose down -v

# 이미지 재빌드
docker-compose up -d --build
```

### MariaDB 연결 실패
```bash
# DB 상태 확인
docker-compose logs db

# DB 초기화
docker-compose exec db mysql -u root -proot123! -e "SELECT 1"
```

### Gemini API 키 오류
```bash
# .env 파일 확인
cat .env | grep GEMINI_API_KEY

# 환경 변수 올바르게 주입되었는지 확인
docker-compose logs app | grep -i gemini
```

---

## 문의 및 연락처

- 프로젝트 경로: `C:\Project\engTest`
- 빌드: `./gradlew build`
- 실행: `docker-compose up -d`
- 접속: `http://localhost:8080`

---

**마지막 업데이트:** 2026-01-15
**빌드 상태:** ✅ SUCCESS
**테스트 상태:** ⏳ 대기 (API 키 필요)
