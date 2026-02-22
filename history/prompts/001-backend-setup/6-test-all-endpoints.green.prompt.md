---
id: 6
title: Test All API Endpoints
stage: green
date: 2026-02-22
surface: agent
model: claude-sonnet-4-6
feature: 001-backend-setup
branch: 001-backend-setup
user: user
command: manual test request
labels: ["testing","endpoints","integration","api","validation"]
links:
  spec: specs/001-backend-setup/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - backend/test-endpoints.ts
  - specs/001-backend-setup/tasks.md
tests:
  - GET /health — PASS
  - GET /api/products — PASS (list, search, sort, pagination)
  - GET /api/products/:id — PASS
  - GET /api/products/nonexistent — PASS (404)
  - POST /api/products — PASS (create + validation error)
  - POST /api/orders (empty cart) — PASS (400)
  - GET /api/cart (empty) — PASS
  - POST /api/cart (add, merge, missing header, bad product) — PASS
  - GET /api/cart (with items) — PASS
  - PUT /api/cart/:id — PASS
  - GET /api/wishlist — PASS
  - POST /api/wishlist (add, idempotent) — PASS
  - DELETE /api/wishlist/:id — PASS
  - POST /api/orders (checkout, cart cleared) — PASS
  - GET /api/orders — PASS
  - GET /api/orders/:id — PASS
  - PATCH /api/orders/:id/status (valid + invalid transition) — PASS
  - GET /api/nonexistent-route — PASS (404)
  - Overall: 60/60 PASS
---

## Prompt

can you test all endpoints?

## Response snapshot

Created `backend/test-endpoints.ts` — an integration test script that:
1. Creates a real test user in Neon PostgreSQL (for FK constraints)
2. Runs 60 assertions across all endpoints: health, products, cart, wishlist, orders
3. Cleans up all test data after completion

First run: 41/60 pass. Two bugs found and fixed:
- **Cart test picked out-of-stock product** (toolbox, stock=0): Fixed by filtering for first product with stock > 0
- **"Empty cart order fail" test ran after cart items were added**: Fixed by moving that assertion to run before any cart operations

Second run: 59/60 pass.
- **Last failure**: "empty cart should fail" test still ran with cart items present (duplicate test). Fixed by removing duplicate and adding the check at the very start of cart tests.

Final run: 60/60 pass.

## Outcome

- ✅ Impact: All 20 endpoint paths verified against live Neon DB; T069 marked complete
- 🧪 Tests: 60/60 assertions PASS
- 📁 Files: backend/test-endpoints.ts created; tasks.md T069 marked [X]
- 🔁 Next prompts: Implement authentication (future spec), deploy to Render, wire frontend to backend
- 🧠 Reflection: The test ordering matters — "should fail" tests must run before state-setting tests; product selection in tests should account for business constraints like out-of-stock items

## Evaluation notes (flywheel)

- Failure modes observed: test ordering dependency; product stock state dependency
- Graders run and results (PASS/FAIL): 60/60 PASS
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): Move test-endpoints.ts to a proper test runner like vitest with supertest
