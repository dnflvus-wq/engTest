# EstellExam - AI Maintenance Guide

## Project Overview
4명의 직장 동료가 점심시간에 주 1회 영어 시험을 치르는 웹앱.
온라인(텍스트 입력) + 오프라인(답안지 촬영 OCR) 시험 모드 지원.
업적/뱃지 시스템, 학습 자료, 진도 관리 기능 포함.

## Tech Stack
- **Backend**: Spring Boot 3.4.1 + Java 21 + MyBatis + MariaDB 10.11
- **Frontend**: React 19 + Vite 7 + React Router 7
- **External API**: Google Gemini (문제 생성, OCR, 채점)
- **Deployment**: Docker Compose (3 containers: frontend/app/db)

## Build & Run Commands
```bash
# Backend build (test 제외)
./gradlew build -x test

# Frontend build
cd frontend-react && npm run build

# Docker 전체 실행
docker compose up --build

# 로컬 개발 (백엔드)
./gradlew bootRun  # .env 파일에서 환경변수 자동 로드
```

## Ports
| Service  | Container Port | Host Port |
|----------|---------------|-----------|
| Frontend | 80 (Nginx)    | 23145     |
| Backend  | 8080          | 12345     |
| MariaDB  | 3306          | 23146     |

## Architecture Rules

### Backend Layer Structure
```
controller/  -> HTTP 요청/응답만 처리. 비즈니스 로직 금지.
service/     -> 비즈니스 로직. @Transactional은 서비스에서만.
mapper/      -> MyBatis 인터페이스 (SQL은 resources/mapper/*.xml)
dto/         -> 데이터 객체 (@Data @Builder @NoArgsConstructor @AllArgsConstructor)
config/      -> Spring 설정, AOP, 스케줄러
utils/       -> 순수 유틸리티 (TierUtils 등)
```

### Naming Conventions
- **Controller**: `XxxController.java` + `@RequestMapping("/api/xxx")`
- **Service**: `XxxService.java` + `@Service @RequiredArgsConstructor`
- **Mapper**: `XxxMapper.java` (interface) + `XxxMapper.xml` (SQL)
- **DTO**: `Xxx.java` with Lombok annotations
- **Frontend pages**: `src/pages/Xxx.jsx` (PascalCase)
- **Frontend components**: `src/components/xxx/Xxx.jsx`

### Code Patterns
- Lombok 사용: `@Data`, `@Builder`, `@Slf4j`, `@RequiredArgsConstructor`
- MyBatis XML에서 반복 SQL은 `<sql id="...">` + `<include refid="..."/>` 사용
- 컨트롤러에서 에러 처리: try-catch + `ResponseEntity.badRequest()` 또는 `internalServerError()`
- 프론트엔드 API 호출: `src/utils/api.js`의 `api.get()`, `api.post()` 사용
- 공통 상수: `frontend-react/src/constants/badge.js` (RARITY_COLORS, TIER_COLORS 등)
- 공통 컴포넌트: `frontend-react/src/components/common/` (LoadingSpinner, ConfirmModal, ClaySelect)

## Key Files Map

### Backend - Controllers (API Endpoints)
| Controller | Base Path | 역할 |
|-----------|-----------|------|
| UserController | /api/users | 로그인/로그아웃/사용자 관리 |
| RoundController | /api/rounds | 회차 CRUD, 문제 생성, 복습 문제 |
| ExamController | /api/exams | 시험 시작/제출/채점, OCR |
| AchievementController | /api | 업적(/achievements), 뱃지(/badges), 액션추적(/actions) |
| ProgressController | /api/progress | 학습 진도 |
| LogController | /api/logs | 활동 로그 관리 |
| StatsController | /api/stats | 통계 (대시보드, 회차별) |
| MaterialController | /api/rounds/{roundId}/materials | 학습 자료 (YouTube, PPT) |

### Backend - Services (Business Logic)
| Service | 역할 |
|---------|------|
| GeminiService | Gemini API 호출 (문제 생성, OCR, 채점, 발음기호) |
| ExamService | 시험 시작/제출/채점/정답 비교 (축약형 처리 포함) |
| AchievementCheckService | 업적 달성 조건 체크 (11개 카테고리, 4개 티어) |
| AchievementService | 업적 진행도 관리, 뱃지 수여 |
| RoundService | 회차 CRUD |
| QuestionService | 문제 CRUD |

### Frontend - Pages
| Page | Route | 역할 |
|------|-------|------|
| Login | / | 사용자 선택 로그인 |
| Dashboard | /dashboard | 메인 대시보드 |
| ExamList | /exam | 시험 회차 목록 |
| ModeSelection | /exam/:roundId/mode | 온라인/오프라인 선택 |
| OnlineExam | /exam/:roundId/online/:examId | 온라인 시험 |
| OfflineExam | /exam/:roundId/offline/:examId | 오프라인 시험 (OCR) |
| Result | /result/:examId | 시험 결과 |
| Study | /study/:roundId | 단어 학습 + TTS |
| History | /history | 시험 이력 |
| Analytics | /analytics | 성적 분석 |
| Progress | /progress | 교재 진도 |
| Achievements | /achievements | 업적/뱃지 |
| Logs | /logs | 활동 로그 (관리자) |
| Admin | /admin/* | 관리자 (회차/문제/자료 관리) |

## Database Schema (Key Tables)
- `users` - 사용자 (4명, role: ADMIN/USER)
- `rounds` - 시험 회차
- `questions` - 문제 (round_id FK)
- `vocabulary_words` - 단어장 (round_id FK)
- `exams` - 시험 기록 (user_id, round_id FK)
- `exam_answers` - 답안 (exam_id, question_id FK)
- `achievements` - 업적 정의 (11 categories, 4 tiers)
- `user_achievements` - 유저별 업적 달성
- `badges` - 뱃지 정의 (achievement_id FK)
- `user_badges` - 유저별 뱃지 (slot_number 1~5)
- `book_chapters` - 교재 챕터 (진도 추적)
- `activity_logs` - 활동 로그
- DB 초기화 SQL: `src/main/resources/sql/prod_dump.sql`

## Critical Stability Notes
- **기능 안정성이 최우선**: 리팩토링 시 기존 기능이 깨지면 안 됨
- **4명만 사용**: 스케일 고려 불필요, 단순함 유지
- **주 1회 시험**: 야간/주말/연속시험 관련 기능 불필요
- **Gemini API**: API 키는 `.env` 파일에 `GEMINI_API_KEY`로 관리
- **Session 기반 인증**: JWT 아님. `HttpSession`으로 로그인 상태 관리
- **Achievement 티어**: BRONZE -> SILVER -> GOLD -> DIAMOND (공통 유틸: `utils/TierUtils.java`)
