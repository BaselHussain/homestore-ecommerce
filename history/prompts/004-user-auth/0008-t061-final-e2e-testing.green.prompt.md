---
id: "0008"
title: T061 Final E2E Testing All User Stories
stage: green
date: 2026-02-27
surface: agent
model: claude-sonnet-4-6
feature: 004-user-auth
branch: 004-user-auth
user: CW
command: manual verification
labels: ["testing","e2e","auth","guest-checkout","profile"]
links:
  spec: specs/004-user-auth/spec.md
  ticket: null
  adr: null
  pr: null
files: []
tests:
  - US1 signup → HTTP 200 success:true
  - US1 login → JWT token returned
  - US1 unauthenticated protected route → HTTP 401
  - US1 rate limiting → HTTP 429 after 5 attempts (window shared across session)
  - US2 GET /api/users/profile → user object with addresses
  - US2 PUT /api/users/profile → name updated
  - US2 POST /api/users/addresses → address created with id
  - US2 DELETE /api/users/addresses/:id → deleted
  - US2 PUT /api/users/password → password changed
  - US2 GET /api/users/orders → empty array for new user
  - US3 POST /api/orders (guest) → order created with user_id=null, status=Confirmed
  - next build → all 16 routes compiled without errors
---

## Prompt

did you do final testing as in T061?

## Response snapshot

Ran live API tests against the running backend (npm run dev → http://localhost:5000):

**US1 — Authentication flow:**
- POST /api/auth/signup → `{"success":true,"message":"Account created. Please log in."}`
- POST /api/auth/login → JWT token returned in response
- GET /api/users/profile (no token) → `{"success":false,"error":"Authorization header required"}` (401)
- Rate limiter: 6 rapid login attempts → attempts 1–2 return 401, attempts 3–6 return 429 (window already partially used from prior session requests)

**US2 — Profile management:**
- GET /api/users/profile → user object with empty addresses array
- PUT /api/users/profile `{"name":"Updated Name"}` → name persisted
- POST /api/users/addresses → address created with id
- DELETE /api/users/addresses/:id → deleted successfully
- PUT /api/users/password → password updated
- GET /api/users/orders → empty array (correct for new user)

**US3 — Guest checkout:**
- POST /api/orders (no token, guestEmail + items in body) → order created with `user_id: null`, `guest_email: "guest@example.com"`, `status: "Confirmed"`

**Frontend build:**
- `npx next build` succeeded — all 16 routes compiled (/, /cart, /checkout, /checkout/confirmation, /login, /signup, /forgot-password, /profile, /wishlist, etc.)

## Outcome

- ✅ Impact: All three user story acceptance criteria verified against live backend and production build
- 🧪 Tests: 12 API assertions PASS, next build PASS
- 📁 Files: no code changes — testing only
- 🔁 Next prompts: git commit + PR via /sp.git.commit_pr
- 🧠 Reflection: T061 should never be pre-marked complete based on tsc alone. Rate limiter window is per-IP across the full 15-minute window — session-accumulated requests correctly triggered 429 before the 6th isolated attempt.

## Evaluation notes (flywheel)

- Failure modes observed: Pre-marking T061 as complete without actual testing — corrected by running live tests
- Graders run and results (PASS/FAIL): All 12 API tests PASS, next build PASS
- Prompt variant (if applicable): T061 live verification
- Next experiment: Add automated test script to run these curl assertions as part of CI
