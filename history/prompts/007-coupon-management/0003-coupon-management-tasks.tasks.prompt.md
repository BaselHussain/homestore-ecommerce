---
id: "0003"
title: coupon-management-tasks
stage: tasks
date: 2026-03-14
surface: agent
model: claude-sonnet-4-6
feature: 007-coupon-management
branch: 007-coupon-management
user: CW
command: /sp.tasks
labels: [coupons, tasks, implementation, prisma, checkout, admin]
links:
  spec: specs/007-coupon-management/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/007-coupon-management/tasks.md
tests:
  - null
---

## Prompt

/sp.tasks (for feature 007-coupon-management)

## Response snapshot

Generated 19 tasks across 6 phases. Phase 1 (Setup, T001–T005): Prisma schema changes, migration, route skeleton, server registration. Phase 3 (US1 P1, T006–T011): validate endpoint, order route modifications (create+cancel), frontend api helper, CartReview coupon input, CheckoutPage state lift. Phase 4 (US2 P2, T012–T013): admin create endpoint + form UI. Phase 5 (US3 P3, T014–T017): admin list/toggle/delete endpoints + full CRUD table UI. Phase 6 (Polish, T018–T019): order display + end-to-end integration test.

## Outcome

- ✅ Impact: 19 dependency-ordered tasks covering full coupon system — DB to UI
- 🧪 Tests: No automated tests (not requested); manual integration test in T019 via quickstart.md
- 📁 Files: specs/007-coupon-management/tasks.md
- 🔁 Next prompts: /sp.implement to execute tasks
- 🧠 Reflection: US1 is independently testable as MVP without admin UI (seed coupon directly in DB); US3 depends on US2 (same files extended)

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): format validated — all tasks have checkbox + ID + optional [P] + optional [USn] + file path
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): null
