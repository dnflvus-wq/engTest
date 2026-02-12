# Achievement Notification Modal Bug

## Status: Resolved (2026-02-12)

## Problem
Achievement unlock modal shows duplicates or fails to display on login.

## Root Cause
1. **React StrictMode double-mount**: `main.jsx` uses `<StrictMode>`, which in dev mode mounts components twice. If backend marks achievements as read on fetch, the second mount gets empty data.
2. **Frontend dedup was incomplete**: Original code only checked queue state, not `current` item or previously shown items. Items moved from queue to `current` could be re-added on next poll.
3. **Race condition**: `@Async checkAchievements("LOGIN")` on backend vs frontend `checkUnread()` polling have timing overlap.

## Applied Fixes
- **Frontend** (`AchievementUnlockModal.jsx`):
  - `useRef(new Set())` tracks all seen achievement IDs (survives StrictMode)
  - Calls `POST /mark-read` immediately after receiving new items
  - **Added delayed re-check (2.5s)** to catch async achievements from LOGIN race condition
  - **Added `user?.id` watcher** to clear `shownIdsRef` on logout/re-login (prevents stale ID filtering)
- **Backend** (`AchievementService.java`): `getUnnotifiedAchievements()` returns data without auto-marking (reverted)
