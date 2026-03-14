---
id: "0002"
title: coupon-management-plan
stage: plan
date: 2026-03-14
surface: agent
model: claude-sonnet-4-6
feature: 007-coupon-management
branch: 007-coupon-management
user: CW
command: /sp.plan
labels: [coupons, planning, data-model, api-contracts, prisma]
links:
  spec: specs/007-coupon-management/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/007-coupon-management/plan.md
  - specs/007-coupon-management/research.md
  - specs/007-coupon-management/data-model.md
  - specs/007-coupon-management/quickstart.md
  - specs/007-coupon-management/contracts/api.md
tests:
  - null
---

## Prompt

/sp.plan (for feature 007-coupon-management)

## Response snapshot

Generated full implementation plan for coupon management system. Created research.md (5 decisions: dual validation, dedicated table, Prisma transaction, uppercase normalisation, CartReview placement), data-model.md (Coupon model + Order extension), contracts/api.md (5 admin endpoints + 1 public validate + modified orders endpoint), quickstart.md, and plan.md. Constitution check passed all 7 principles. Implementation sequence: DB layer → backend routes → order route changes → frontend API helper → CartReview → CheckoutPage → admin page → integration test.

## Outcome

- ✅ Impact: Full plan ready — all design decisions documented, API contracts defined, data model specified
- 🧪 Tests: Manual integration tests per quickstart.md
- 📁 Files: plan.md, research.md, data-model.md, quickstart.md, contracts/api.md
- 🔁 Next prompts: /sp.tasks to generate dependency-ordered task list
- 🧠 Reflection: Prisma $transaction for usage count concurrency is the key risk mitigation; denormalised coupon_code/discount_amount on Order preserves history

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): constitution check all pass
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): null
