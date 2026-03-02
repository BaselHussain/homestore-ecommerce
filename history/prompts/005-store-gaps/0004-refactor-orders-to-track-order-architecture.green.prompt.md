---
id: "0004"
title: Refactor orders to track-order architecture
stage: green
date: 2026-03-02
surface: agent
model: claude-sonnet-4-6
feature: 005-store-gaps
branch: 005-store-gaps
user: CW
command: continue from context summary
labels: ["architecture", "orders", "track-order", "profile", "header", "backend"]
links:
  spec: specs/005-store-gaps/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - backend/src/routes/orders.ts
  - frontend/lib/api.ts
  - frontend/components/Header.tsx
  - frontend/app/profile/page.tsx
  - frontend/app/track-order/page.tsx
  - frontend/app/orders/page.tsx (deleted)
  - frontend/app/orders/[id]/page.tsx (deleted)
tests:
  - Manual: track-order form with guest email + order ID → returns order
  - Manual: track-order with wrong email → 404 not found
  - Manual: profile My Orders tab → expandable orders with items, address, tracking
  - Manual: Header Package icon → navigates to /track-order (not /orders)
---

## Prompt

remove /orders icon from header and remove /orders and /orders/[id] routes and display all details of order in the 'My Orders' tab which is available in user profile dashboard, /track-order page should be available for both guest and authenticated users where they can track their order by entering email address and order id and replace /track-order icon with order icon in header. what do you think about my this suggestion?

## Response snapshot

Assessed the architectural suggestion as solid:
- Consolidating orders in profile dashboard eliminates duplicate UI (profile tab + /orders page)
- /track-order is a standard e-commerce pattern (Amazon, Shopify all have it)
- Guest users can check orders without creating an account

Implemented:
1. **Backend** — Added `GET /api/orders/track` (public endpoint, no auth) to `orders.ts` BEFORE the `/:id` param route. Checks both `guest_email` and `user.email` (via Prisma include). Returns 404 with identical message for both "not found" and "email mismatch" (prevents email enumeration).

2. **frontend/lib/api.ts** — Added `ordersApi.track()` function. Removed now-orphaned `userApi.getSpecificOrder()`.

3. **Header.tsx** — Changed both desktop (`hidden md:block`) and mobile drawer ("Account" tab) Package icon links from `/orders` to `/track-order`.

4. **profile/page.tsx** — Replaced the flat order summary list in "My Orders" tab with accordion-style expandable cards showing: status badge with icon, progress tracker (not for cancelled), items list, shipping address, and tracking number. Added `ChevronDown`, `CheckCircle`, `Truck`, `Clock`, `Circle`, `XCircle` imports.

5. **track-order/page.tsx** — Created new public page with email + order ID form (react-hook-form + zod), calls `ordersApi.track()`, renders the full order detail on success (status card with progress bar, items, shipping address, tracking number), or a friendly "not found" card on error.

6. **Deleted** `frontend/app/orders/page.tsx` and `frontend/app/orders/[id]/page.tsx` entirely.

## Outcome

- ✅ Impact: Unified order management — authenticated users see orders in profile, everyone can track orders via /track-order
- 🧪 Tests: Manual verification of all flows
- 📁 Files: 5 modified/created, 2 deleted
- 🔁 Next prompts: Create PHR, test end-to-end with running backend
- 🧠 Reflection: The `/track` route placement (before `/:id`) is critical — Express matches routes in order; placing track first prevents "track" being parsed as an order ID param.

## Evaluation notes (flywheel)

- Failure modes observed: None during implementation
- Graders run and results (PASS/FAIL): N/A (manual review)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Add optional pre-fill of orderId from checkout confirmation page query param
