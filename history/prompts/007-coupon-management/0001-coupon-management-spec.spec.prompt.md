---
id: "0001"
title: coupon-management-spec
stage: spec
date: 2026-03-14
surface: agent
model: claude-sonnet-4-6
feature: 007-coupon-management
branch: 007-coupon-management
user: CW
command: /sp.specify
labels: [coupons, discounts, checkout, admin]
links:
  spec: specs/007-coupon-management/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/007-coupon-management/spec.md
  - specs/007-coupon-management/checklists/requirements.md
tests:
  - null
---

## Prompt

Coupons system — admin can create/manage discount coupons (percentage or fixed amount, min order value, expiry date, usage limits). Customers can apply coupon codes at checkout. Coupon validation on frontend and backend. Show discount line in order summary.

## Response snapshot

Created feature branch `007-coupon-management` and wrote full specification at `specs/007-coupon-management/spec.md`. Spec covers 3 user stories (P1: customer applies coupon, P2: admin creates coupon, P3: admin manages coupons), 13 functional requirements, Coupon entity and Order extension, 5 success criteria, edge cases, and assumptions. All checklist items pass — no NEEDS CLARIFICATION markers.

## Outcome

- ✅ Impact: Full spec ready for /sp.tasks — coupons end-to-end (admin CRUD + checkout apply + order record)
- 🧪 Tests: No tests at spec stage
- 📁 Files: specs/007-coupon-management/spec.md, checklists/requirements.md
- 🔁 Next prompts: /sp.tasks to generate dependency-ordered task list
- 🧠 Reflection: Kept spec business-focused; deferred all DB/API implementation details to plan/tasks phase

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): checklist all pass
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): null
