---
id: "0012"
title: Connect Orders Page to Backend
stage: green
date: 2026-03-01
surface: agent
model: claude-sonnet-4-6
feature: 004-user-auth
branch: main
user: CW
command: continue session
labels: ["orders","backend","client-component","auth"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - frontend/app/orders/page.tsx
tests:
  - manual E2E: visit /orders when unauthenticated → redirect to /login
  - manual E2E: visit /orders when authenticated → real orders load
  - manual E2E: authenticated user with no orders → empty state shown
---

## Prompt

confirm that i think we have still dummy/mock orders in /orders page

## Response snapshot

Confirmed /orders page had fully hardcoded mock data (5 fake ORD-2024-00x orders). Converted to a `'use client'` component that:
- Uses `useAuth()` to guard the route (redirects unauthenticated users to `/login?redirect=/orders`)
- Fetches real orders via `userApi.getOrders()` on mount
- Maps backend fields: `id` (UUID last 8 chars → ORD-XXXXXXXX), `created_at` → locale date, `total_amount` → float, `items` JSON → itemName/itemCount, `tracking_number` → tracking
- Maps backend status values (Confirmed/Processing/Shipped/Delivered/Cancelled/Refunded/Pending) to frontend OrderStatus enum
- Shows spinner while loading, empty state for no orders, order cards otherwise
- Preserves all existing UI (progress bar, status badges, tracking display, animated elements)

## Outcome

- ✅ Impact: /orders now shows real database orders for authenticated users instead of hardcoded mock data
- 🧪 Tests: manual E2E against live backend
- 📁 Files: frontend/app/orders/page.tsx (rewritten)
- 🔁 Next prompts: place a real order through checkout and verify it appears in /orders
- 🧠 Reflection: Backend status strings ('Confirmed', 'Processing', etc.) differ from frontend enum ('processing', 'shipped', etc.) — normalization via mapBackendStatus() handles this cleanly

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): n/a
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): add order detail page/modal
