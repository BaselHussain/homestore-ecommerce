---
id: 4
title: Add E-Commerce Features on Top of Replicated UI
stage: green
date: 2026-02-22
surface: agent
model: claude-sonnet-4-6
feature: 002-frontend-core-features
branch: 002-frontend-core-features
user: BaselHussain
command: Add E-Commerce Features on Top of Replicated homestore-sparkle UI
labels: ["zustand","cart","wishlist","checkout","product-listing","pdp","react-hook-form","zod"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - lib/cart-store.ts
  - lib/wishlist-store.ts
  - hooks/use-cart.ts
  - hooks/use-wishlist.ts
  - contexts/CartContext.tsx
  - components/Header.tsx
  - components/ProductCard.tsx
  - components/ui/label.tsx
  - components/ui/textarea.tsx
  - components/ui/select.tsx
  - components/ui/checkbox.tsx
  - components/ui/form.tsx
  - components/SearchBar.tsx
  - components/ProductImageZoom.tsx
  - components/CartItemRow.tsx
  - components/checkout/StepIndicator.tsx
  - components/checkout/CartReview.tsx
  - components/checkout/ShippingForm.tsx
  - components/checkout/PaymentForm.tsx
  - components/checkout/Confirmation.tsx
  - app/products/page.tsx
  - app/products/[id]/page.tsx
  - app/cart/page.tsx
  - app/checkout/page.tsx
  - app/wishlist/page.tsx
tests:
  - npm run build (passed — all 11 routes generated, 0 TypeScript errors)
---

## Prompt

Add E-Commerce Features on Top of Replicated homestore-sparkle UI

Context: Next.js 16+ frontend at E:/e-commerce claude/frontend/ with homestore-sparkle UI already replicated. Create Zustand stores for cart/wishlist with localStorage persistence, update CartContext for backward compatibility, add wishlist link to Header, add wishlist toggle to ProductCard, create new pages (products listing, PDP, cart, checkout, wishlist), add required shadcn/ui components (label, textarea, select, checkbox, form), and create supporting components (SearchBar, ProductImageZoom, CartItemRow, checkout step components).

## Response snapshot

Created 24 new files and modified 3 existing files:

1. Zustand stores: `lib/cart-store.ts` (persist to homestore-cart) and `lib/wishlist-store.ts` (persist to homestore-wishlist)
2. Hooks: `hooks/use-cart.ts` and `hooks/use-wishlist.ts` wrapping the stores
3. Updated `contexts/CartContext.tsx` to wrap Zustand store while maintaining `useCart()` backward compatibility
4. Updated `components/Header.tsx` to add wishlist heart icon with badge count
5. Updated `components/ProductCard.tsx` to connect wishlist toggle with filled/empty heart state
6. Added shadcn/ui components: label, textarea, select, checkbox, form (React Hook Form integration)
7. New components: SearchBar (debounced, 300ms), ProductImageZoom (2x CSS transform + mousemove pan), CartItemRow, checkout/* (StepIndicator, CartReview, ShippingForm with RHF+Zod, PaymentForm simulated, Confirmation)
8. New pages: /products (search + category filter + skeleton loading), /products/[id] (PDP with zoom, qty selector, wishlist), /cart (Zustand-driven, order summary), /checkout (4-step flow), /wishlist (grid with add-to-cart + remove)

Build result: `npm run build` passed with 0 errors, all 11 routes compiled.

## Outcome

- Impact: Full e-commerce feature set added on top of existing homestore-sparkle UI without removing any existing components. Cart persists to localStorage, wishlist persists to localStorage. Multi-step checkout with RHF+Zod validation on shipping form.
- Tests: npm run build — PASS (0 TypeScript errors, 11 routes generated)
- Files: 24 created, 3 modified
- Next prompts: Connect products/cart/wishlist pages to real backend API (replace mock data), add authentication, implement order history page
- Reflection: Used `use(params)` for Next.js 16 dynamic route params (Promise-based). Wrapped ProductsPage in Suspense for useSearchParams(). Zod v4 uses `import { z } from 'zod'`. CartContext backward-compatible wrapper pattern worked cleanly.

## Evaluation notes (flywheel)

- Failure modes observed: None — build passed first try
- Graders run and results (PASS/FAIL): npm run build — PASS
- Prompt variant (if applicable): N/A
- Next experiment: Swap mock data for real API calls using TanStack Query
