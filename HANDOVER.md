# EstellExam - Current State & Next Steps

## Recent Changes (2026-02-11)

### Backend Refactoring (Phase 1~4)

**Phase 1: Unused Code Deletion**
- RoundController: `GET /rounds/stats`, `POST /rounds/extract-words` 삭제
- ProgressController: 3개 미사용 chapters 엔드포인트 삭제
- MaterialService: `getMaterialById()` 삭제
- QuestionService: `countByRoundId()` 삭제
- ProgressService: 3개 미사용 메서드 삭제
- AchievementMapper: `getLastSecondPattern()`, `getMaxExamsInOneDay()` 삭제
- AchievementCheckService: `calcPerfectStreak()` 데드 루프 정리
- GeminiService: 중복 JavaDoc 삭제

**Phase 2: Duplicate Code Consolidation**
- **NEW: `utils/TierUtils.java`** - 티어 상수/유틸 통합
- AchievementCheckService/AchievementService: TierUtils 사용으로 중복 제거
- GeminiService: `extractJsonFromResponse()`, `getGeminiApiUrl()` 공통 헬퍼 추출 (719 -> 601줄)
- RoundController: `cleanupRoundData()` 헬퍼 추출
- MaterialService: `deletePptFile()` 헬퍼 추출
- AchievementCheckService: `checkTiered()`/`checkTieredReverse()` 통합, `calcFirstSubmitCount` 제거
- ActivityLogMapper.xml: WHERE 조건 SQL 프래그먼트화
- ExamMapper.xml: SELECT+JOIN SQL 프래그먼트화

**Phase 3: Business Logic to Service Layer**
- ExamController: `ExamWithQuestions` 헬퍼 추출, 오프라인 채점 루프 -> `ExamService.saveGeminiGradeResults()`
- ExamService: `normalizeAnswer()` public -> private

**Phase 4: Code Quality**
- AchievementController: `@RequestMapping("/api")` 추가, 메서드별 `/api/` 접두사 제거
- VocabularyService: `System.err.println` -> `@Slf4j log.warn`
- MaterialService: 빈 catch 블록에 `@Slf4j log.warn` 추가
- ProgressService: 매직넘버 `2` -> `MANUAL_COMPLETION_THRESHOLD` 상수화

### Frontend Cleanup
- 미사용 파일 삭제: `useApi.js`, `EmptyState.jsx`
- `console.log` 제거 (AuthContext.jsx)
- RARITY_COLORS/TIER_COLORS/TIER_ORDER 중복 -> `constants/badge.js`로 통합

### DB Migration
- Docker DB에 `migrate_v6.sql` 실행: achievements, badges, user_achievements, user_badges, user_action_counters, achievement_progress 테이블 + 시드 데이터 생성
- `migrate_v6_patch.sql` 실행: 불필요 8개 업적 삭제 (NIGHT_OWL, EARLY_BIRD 등)
- 결과: 65 achievements, 34 badges, 총 19 테이블

### Comprehensive Browser Testing (Playwright)
전 페이지 데스크톱(1280x720) + 모바일(375x812) 테스트 완료. 버그 없음.

| 페이지 | 경로 | Desktop | Mobile |
|--------|------|---------|--------|
| 로그인 | `/` | PASS | - |
| 대시보드 | `/dashboard` | PASS | PASS |
| 시험 목록 | `/exam` | PASS | PASS |
| 학습 | `/study/:id` | PASS | - |
| 시험 결과 | `/result/:id` | PASS | - |
| 히스토리 | `/history` | PASS | PASS |
| Analytics | `/analytics` | PASS | - |
| Progress | `/progress` | PASS | PASS |
| 업적/뱃지 | `/achievements` | PASS | PASS |
| Activity Logs | `/logs` | PASS | PASS |
| 관리자 | `/admin` | PASS | PASS |
| 관리자 상세 | `/admin/:id` | PASS | - |

## Previous Work (Already Completed)
- 업적 시스템: 불필요 8개 업적 삭제 (NIGHT_OWL, EARLY_BIRD 등)
- 업적 설명 "N회/N점" -> 실제 수치 표시 (formatDescription)
- 달성 모달 개선 (AchievementUnlockModal.jsx)

## Known Issues / TODO
- [ ] 프론트엔드 chunk 사이즈 경고 (650KB) - dynamic import 고려
- [ ] `useFetch.js` hook 있지만 대부분 직접 `api.get()`/`api.post()` 사용 - 통일 고려

## Architecture Notes
- 전체 프로젝트 구조/빌드/파일맵은 `CLAUDE.md` 참조
