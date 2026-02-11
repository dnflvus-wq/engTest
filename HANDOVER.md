# 업적 시스템 개선: 불필요 업적 삭제 + 설명 수치 표시 + 뱃지 테스트

## Context
EstellExam은 4명의 직장 동료가 점심시간에 주 1회 영어 시험을 치르는 앱.
따라서 야간/새벽/주말/하루 다시험 등의 업적은 의미가 없음.
또한 업적 설명에 "N회", "N점" 같은 플레이스홀더가 남아있어 실제 수치로 교체 필요.

## 1. 삭제할 업적 (8개)

| ID | 이름 | 삭제 사유 |
|---|---|---|
| NIGHT_OWL | 야행성 | 점심시간에만 시험 |
| EARLY_BIRD | 아침형 인간 | 점심시간에만 시험 |
| WEEKEND_WARRIOR | 주말 전사 | 주말 시험 없음 |
| MIDNIGHT_EXAM | 자정의 도전 | 자정 시험 없음 |
| DAILY_EXAM | 하루 다시험 | 주 1회 시험 |
| TRIPLE_EXAM_DAY | 삼시세끼 시험 | 주 1회 시험 |
| BEAT_EVERYONE | 전원 격파 | 항상 4명이라 RANK_FIRST와 중복 |
| EXAM_STREAK | 시험 연속 | "N일 연속 시험" - 주 1회라 연속일 불가 |

### 수정 파일 + 작업

**DB: `migrate_v6_patch.sql` 작성**

```sql
DELETE FROM user_achievements WHERE achievement_id IN ('NIGHT_OWL','EARLY_BIRD','WEEKEND_WARRIOR','MIDNIGHT_EXAM','DAILY_EXAM','TRIPLE_EXAM_DAY','BEAT_EVERYONE','EXAM_STREAK');
DELETE FROM achievement_progress WHERE achievement_id IN (...);
DELETE FROM badges WHERE achievement_id IN (...);
DELETE FROM user_badges WHERE badge_id IN (SELECT id FROM badges WHERE achievement_id IN (...));
DELETE FROM achievements WHERE id IN (...);
```
→ Docker exec로 실행

**Backend: `AchievementCheckService.java`**
- 삭제된 업적의 체크 로직 제거 (NIGHT_OWL, EARLY_BIRD 등의 case문)

## 2. "N회/N점" → 실제 수치 표시

### 현재 문제
DB `descriptionKr`에 "시험을 N회 완료했습니다" 처럼 "N"이 플레이스홀더로 남아있음.

### 해결 방법: 프론트엔드에서 동적 치환

`Achievements.jsx`에 헬퍼 함수 추가:

```javascript
const formatDescription = (achievement) => {
    let desc = achievement.descriptionKr;
    if (!achievement.isTiered || !achievement.tierThresholds) return desc;

    const tiers = JSON.parse(achievement.tierThresholds);
    const tierOrder = ['BRONZE','SILVER','GOLD','DIAMOND'];

    // 현재 다음 목표 수치 결정
    let displayValue;
    if (achievement.targetValue && achievement.nextTier !== 'COMPLETE') {
        displayValue = achievement.targetValue; // 다음 티어 목표값
    } else if (achievement.currentTier) {
        displayValue = tiers[achievement.currentTier]; // 달성한 티어 값
    } else {
        displayValue = tiers.BRONZE; // 아직 미달성이면 Bronze 기준
    }

    return desc.replace('N', displayValue);
};
```

### 적용 위치:
- 업적 카드 설명 표시 부분
- 달성 모달 (`AchievementUnlockModal.jsx`)

### 달성 모달 개선
`AchievementUnlockModal.jsx`:
- 달성한 티어의 실제 수치로 "N" 치환
  - 예: "시험을 3회 완료했습니다" (BRONZE 달성 시)
- 다음 티어가 있으면 "다음 목표: 10회 (SILVER)" 표시

### 업적 카드 진행도 표시 개선
`Achievements.jsx` 카드 내:
- 프로그레스바 아래에 현재값/목표값 표시는 이미 있음 (`currentValue / targetValue`)
- 설명 텍스트만 "N" → 실제 수치로 교체하면 됨

## 3. 뱃지 테스트용 데이터 INSERT

뱃지 장착/해제 UI가 정상 동작하는지 확인하기 위해, 이성현(userId=3) 유저에게 테스트 뱃지 수여:

```sql
-- EXAM_COUNT Gold 티어 달성 → EXAM_VETERAN 뱃지 수여
INSERT INTO user_achievements (user_id, achievement_id, tier, current_value, unlocked_at, is_notified)
VALUES (3, 'EXAM_COUNT', 'GOLD', 25, NOW(), FALSE);

INSERT INTO user_badges (user_id, badge_id, earned_at)
VALUES (3, 'BADGE_EXAM_VETERAN', NOW());

-- 2-3개 더 추가하여 뱃지 장착 테스트 가능하도록
```
→ 브라우저에서 뱃지 장착/해제/Header 표시 확인

## 4. 구현 순서

1. ~~DB 패치: 8개 업적 삭제 SQL 실행~~ ✅
2. ~~Backend: AchievementCheckService에서 삭제된 업적 case문 제거~~ ✅
3. ~~Frontend - Achievements.jsx: formatDescription() 함수 추가, 카드 설명에 적용~~ ✅
4. ~~Frontend - AchievementUnlockModal.jsx: 모달에도 formatDescription() 적용 + 다음 목표 표시~~ ✅
5. 뱃지 테스트 데이터: INSERT 실행
6. 브라우저 테스트: 업적 페이지 확인 + 뱃지 장착/해제 + Header 표시

## 5. 검증
- 업적 페이지: 74 → 66개로 줄어들었는지 확인
- "시험을 3회 완료했습니다" 등 실제 수치가 표시되는지 확인
- 달성 모달에도 수치 표시되는지 확인
- 뱃지 슬롯 클릭 → 뱃지 선택 → 장착 → Header에 표시되는지 확인
- 모바일 레이아웃 확인
