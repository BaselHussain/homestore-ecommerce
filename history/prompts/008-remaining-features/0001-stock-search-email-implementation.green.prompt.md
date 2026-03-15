---
id: "0001"
title: Stock Management, Search Autocomplete, Email Notifications
stage: green
date: 2026-03-15
surface: agent
model: claude-sonnet-4-6
feature: 008-remaining-features
branch: development
user: CW
command: implement plan
labels: ["stock-management","search-autocomplete","email-notifications","resend","backend","frontend"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/src/lib/email.ts
  - backend/src/controllers/orderController.ts
  - backend/src/routes/auth.ts
  - backend/.env.example
  - backend/package.json
  - frontend/components/ProductCard.tsx
  - frontend/components/SearchAutocomplete.tsx
  - frontend/components/Header.tsx
tests:
  - "tsc --noEmit: backend (pass)"
  - "tsc --noEmit: frontend (pass)"
---

## Prompt

Implement the following plan:

# Plan: Remaining Features — Stock Management, Search Autocomplete, Email Notifications

[Full plan covering Feature 3 (Stock Management), Feature 4 (Search Autocomplete), Feature 1 (Email Notifications). Feature 2 (Order Status Updates) already done.]

## Response snapshot

Implemented all three features in a single commit on branch `development`:

**Feature 3 — Stock Management (backend + frontend)**
- `orderController.ts`: Stock validation before order creation — fetches products, checks `stock >= quantity`, returns 400 with product names if insufficient
- `orderController.ts`: Stock decrement inside `$transaction` on order creation (`product.update { stock: { decrement: qty } }`)
- `orderController.ts`: Stock restore inside `$transaction` when status → `Cancelled` or `Refunded` (`stock: { increment: qty }`)
- `ProductCard.tsx`: `isOutOfStock` now checks `product.stock === 0` in addition to badge; `isLowStock` flag for `0 < stock <= 5` shows "Only X left" below price
- Admin dashboard low-stock panel: already implemented (no changes needed)
- PDP out-of-stock: already implemented (no changes needed)

**Feature 4 — Search Autocomplete**
- New `SearchAutocomplete.tsx`: debounced (350ms) API call to `productsApi.getAll`, min 2 chars, dropdown with image+name+category+price, click→navigate, Escape→close, outside click→close
- `Header.tsx`: replaced plain `<input>` with `<SearchAutocomplete>`, passing `onSelect={closeSearch}` so suggestion navigation also closes the header bar

**Feature 1 — Email Notifications**
- New `backend/src/lib/email.ts`: Resend wrapper with `sendOrderConfirmation`, `sendShippingUpdate`, `sendPasswordReset`; graceful no-op when `RESEND_API_KEY` not set (with console.log fallback for password reset in dev)
- `orderController.ts`: fire-and-forget `sendOrderConfirmation` after order creation; `sendShippingUpdate` when status → Shipped/Delivered
- `auth.ts`: replaced `console.log` with `await sendPasswordReset(email, resetUrl)`
- `.env.example`: added `RESEND_API_KEY` and `FROM_EMAIL`

Both `tsc --noEmit` checks pass (backend + frontend). Committed as `feat(008)` on `development`.

## Outcome

- ✅ Impact: All three remaining pre-payment features implemented and type-safe
- 🧪 Tests: TypeScript compilation clean on both backend and frontend
- 📁 Files: 8 files modified/created, 1 new backend lib, 1 new frontend component
- 🔁 Next prompts: Payment integration (Stripe), deployment (Vercel + Railway)
- 🧠 Reflection: Admin dashboard and PDP out-of-stock were already complete — avoided duplicate work

## Evaluation notes (flywheel)

- Failure modes observed: Prisma Decimal type not assignable to number — fixed with explicit `Number()` cast
- Graders run and results (PASS/FAIL): tsc --noEmit backend PASS, tsc --noEmit frontend PASS
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): Add stock field to checkout validation on frontend cart
