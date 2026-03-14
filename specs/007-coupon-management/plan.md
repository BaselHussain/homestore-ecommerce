# Implementation Plan: Coupon Management System

**Branch**: `007-coupon-management` | **Date**: 2026-03-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-coupon-management/spec.md`

## Summary

Build end-to-end coupon system: admin creates/manages discount coupons (percentage or fixed, optional min order, expiry, usage limits); customers apply coupon codes at checkout with instant validation; discount shown as line item in order summary; coupon usage tracked on orders with decrement on cancellation. Touches Prisma schema (new `Coupon` model + `Order` extension), backend routes, admin panel, and frontend checkout.

## Technical Context

**Language/Version**: TypeScript, Node.js 20.x (backend), Next.js 16+ App Router (frontend + admin)
**Primary Dependencies**: Express.js, Prisma + @prisma/client, zod (validation), shadcn/ui (admin UI)
**Storage**: Neon Serverless PostgreSQL via Prisma ORM
**Testing**: Manual integration testing per quickstart.md; no automated test suite in scope
**Target Platform**: Local dev + Vercel (frontend/admin) + Render (backend)
**Project Type**: Web application (backend + frontend + admin — three separate Next.js/Express apps)
**Performance Goals**: Coupon validate endpoint < 1 second response (SC-001)
**Constraints**: One coupon per order; case-insensitive codes (stored uppercase); EUR currency; no coupon stacking; no editing after creation
**Scale/Scope**: Small admin dataset (tens to low hundreds of coupons)

## Constitution Check

| Principle | Status | Notes |
|---|---|---|
| I. Educational Clarity | ✅ Pass | All new code follows existing patterns; readable |
| II. Engineering Accuracy | ✅ Pass | Next.js App Router, Express, Neon Postgres, Prisma, shadcn/ui |
| III. Practical Applicability | ✅ Pass | Smallest viable change; no new apps added |
| IV. Spec-Driven Development | ✅ Pass | Full SDD trail: spec → clarify → plan → tasks |
| V. Ethical Responsibility | ✅ Pass | No sensitive data; admin-only CRUD protected by existing admin JWT |
| VI. Reproducibility | ✅ Pass | Prisma migration handles DB changes; no manual steps |
| VII. Zero Broken State | ✅ Pass | All new columns nullable; existing orders/checkout unaffected |

**GATE: PASSED** — No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/007-coupon-management/
├── plan.md              ✅ This file
├── research.md          ✅ Phase 0 complete
├── data-model.md        ✅ Phase 1 complete
├── quickstart.md        ✅ Phase 1 complete
├── contracts/
│   └── api.md           ✅ Phase 1 complete
└── tasks.md             ⏳ Phase 2 (/sp.tasks)
```

### Source Code Changes

```text
backend/
├── prisma/
│   └── schema.prisma              # Add Coupon model; extend Order with 2 fields
├── src/
│   ├── routes/
│   │   ├── coupons.ts             # NEW — public validate + admin CRUD
│   │   └── orders.ts              # MODIFY — coupon validation + usage count on create/cancel
│   └── server.ts                  # MODIFY — register coupon routes

frontend/
├── app/
│   └── checkout/
│       └── page.tsx               # MODIFY — coupon state (code + discountAmount)
├── components/
│   └── checkout/
│       └── CartReview.tsx         # MODIFY — add coupon input + discount line
└── lib/
    └── api.ts                     # MODIFY — add couponsApi.validate()

admin/
└── app/
    └── coupons/
        └── page.tsx               # REWRITE — replace placeholder with full CRUD UI
```

**Structure Decision**: Web application option. Three separate apps (backend, frontend, admin) per existing project layout. No new apps or packages introduced.

## Phase 0: Research Summary

See [research.md](./research.md) for full decisions. Key choices:

- **Dual validation**: client-side at apply, server-side re-check at order submission
- **Dedicated `coupons` table** + denormalised `coupon_code`/`discount_amount` on orders
- **Prisma `$transaction`** for usage count increment to prevent race conditions
- **Uppercase normalisation** for case-insensitive codes
- **CartReview component** (checkout step 1) as coupon input location

## Phase 1: Design Artifacts

### Data Model

See [data-model.md](./data-model.md). Summary:
- New `Coupon` model with 10 fields; display status computed at query time
- `Order` model gains `coupon_code String?` and `discount_amount Decimal?`
- No breaking changes — all new columns nullable

### API Contracts

See [contracts/api.md](./contracts/api.md). Endpoints:

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/coupons/validate` | None | Customer applies coupon at checkout |
| GET | `/api/admin/coupons` | Admin JWT | List all coupons |
| POST | `/api/admin/coupons` | Admin JWT | Create coupon |
| PATCH | `/api/admin/coupons/:id/toggle` | Admin JWT | Toggle active/inactive |
| DELETE | `/api/admin/coupons/:id` | Admin JWT | Delete coupon |
| POST | `/api/orders` (modified) | Optional | Order creation with optional coupon |
| PATCH | `/api/orders/:id` (modified) | Auth | Cancellation decrements usage count |

### Quickstart

See [quickstart.md](./quickstart.md).

## Implementation Sequence

Tasks will be generated by `/sp.tasks` in this dependency order:

1. **DB layer** — Prisma schema changes + migration
2. **Backend — coupon routes** — validate + admin CRUD
3. **Backend — order route changes** — coupon on create + decrement on cancel
4. **Frontend — API helper** — `couponsApi.validate()`
5. **Frontend — CartReview** — coupon input + discount line
6. **Frontend — CheckoutPage** — lift coupon state, pass to order create
7. **Admin — Coupons page** — replace placeholder with full CRUD UI
8. **Integration test** — full flow per quickstart.md

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Race condition on usage_count | Low (small store) | Wrap in Prisma `$transaction` |
| Coupon state lost on page refresh | Low | Coupon state is session-local in checkout; customer re-enters if needed |
| Existing orders show NULL coupon fields | None | Nullable columns; no display change for old orders |
