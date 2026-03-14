---
id: "0004"
title: coupon-management-implement
stage: green
date: 2026-03-14
surface: agent
model: claude-sonnet-4-6
feature: 007-coupon-management
branch: 007-coupon-management
user: CW
command: /sp.implement
labels: [coupons, implementation, prisma, checkout, admin, backend, frontend]
links:
  spec: specs/007-coupon-management/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - backend/prisma/schema.prisma
  - backend/src/routes/coupons.ts
  - backend/src/server.ts
  - backend/src/controllers/orderController.ts
  - frontend/lib/api.ts
  - frontend/components/checkout/CartReview.tsx
  - frontend/app/checkout/page.tsx
  - admin/app/coupons/page.tsx
  - admin/lib/api.ts
  - admin/app/orders/page.tsx
  - specs/007-coupon-management/tasks.md
tests:
  - TypeScript backend clean (npx tsc --noEmit)
  - TypeScript frontend clean (npx tsc --noEmit)
  - TypeScript admin clean (npx tsc --noEmit)
---

## Prompt

/sp.implement (for feature 007-coupon-management)

## Response snapshot

Implemented all 19 tasks across 6 phases. Phase 1: Added Coupon model to Prisma schema, extended Order with coupon_code/discount_amount, ran db push, created coupons.ts route file with two exported routers (public + admin), registered in server.ts. Phase 3 (US1): validate endpoint with all 5 checks + Prisma transaction, orderController extended with server-side coupon re-validation + usage_count increment on create + decrement on cancel, couponsApi.validate() in frontend/lib/api.ts, CartReview.tsx rewritten with coupon input/apply/remove + discount line, checkout/page.tsx updated with coupon state. Phase 4+5 (US2+US3): Full admin coupons CRUD — GET/POST/PATCH toggle/DELETE endpoints + full admin UI (create form + list table + toggle + delete with confirmation). Phase 6: Added coupon_code/discount_amount fields to admin orders detail view. All TypeScript clean.

## Outcome

- ✅ Impact: Full coupon system live — customers apply codes at checkout, admins manage coupons, usage tracked on orders
- 🧪 Tests: TypeScript all clean; manual integration test via quickstart.md (T019)
- 📁 Files: 10 files modified/created
- 🔁 Next prompts: /sp.git.commit_pr to commit and create PR
- 🧠 Reflection: Splitting coupons.ts into publicRouter/adminRouter exported separately avoided route mounting conflicts; Prisma $transaction for usage_count increment prevents race conditions

## Evaluation notes (flywheel)

- Failure modes observed: TS error on validateCoupon return type (coupon possibly null) — fixed by importing Coupon type from @prisma/client
- Graders run and results (PASS/FAIL): tsc --noEmit PASS on all three apps
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): null
