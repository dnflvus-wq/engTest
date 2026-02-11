# Achievement Notification Modal Bug

## Status: In Progress (partially fixed)

## Problem
Achievement unlock modal shows duplicates or fails to display on login.

## Root Cause
1. **React StrictMode double-mount**: `main.jsx` uses `<StrictMode>`, which in dev mode mounts components twice. If backend marks achievements as read on fetch, the second mount gets empty data.
2. **Frontend dedup was incomplete**: Original code only checked queue state, not `current` item or previously shown items. Items moved from queue to `current` could be re-added on next poll.
3. **Race condition**: `@Async checkAchievements("LOGIN")` on backend vs frontend `checkUnread()` polling have timing overlap.

## Current Fix Applied
- **Frontend** (`AchievementUnlockModal.jsx`): `useRef(new Set())` tracks all seen achievement IDs (survives StrictMode). Calls `POST /mark-read` immediately after receiving new items.
- **Backend** (`AchievementService.java`): `getUnnotifiedAchievements()` returns data without auto-marking (reverted).

## Remaining Issue
- Fix needs verification on actual deployment (Docker rebuild required for backend changes)
- Need to confirm modals display correctly: each achievement exactly once, no duplicates, no missing items
- Test scenario: logout -> login as any user -> verify each unread achievement shows once

## Test Steps
1. Reset flags: `UPDATE user_achievements SET is_notified = FALSE WHERE user_id = 1;`
2. Login as user 1
3. Verify each achievement modal appears exactly once
4. Refresh page - no modals should reappear
5. Wait 30s+ - no duplicates from polling
