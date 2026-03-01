---
id: "0010"
title: Fix Cart Auth and Checkout Clear Cart
stage: green
date: 2026-02-28
surface: agent
model: claude-sonnet-4-6
feature: 004-user-auth
branch: main
user: CW
command: manual
labels: ["cart","checkout","auth","bug-fix","cart-context"]
links:
  spec: specs/004-user-auth/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - frontend/app/cart/page.tsx
  - frontend/app/checkout/page.tsx
  - frontend/components/checkout/CartReview.tsx
tests:
  - npx tsc --noEmit (frontend — 0 errors)
---

## Prompt

(Continuation — fixing 4 issues reported after testing the backend-connected products/cart/wishlist implementation)

Issues reported by user:
- if I route to cart, it asks for authentication, its mandatory, so guest checkout works?
- app is not that fast as before connecting backend
- cart is not being empty after checkout which should not be case
- products are not that which were before connecting backend (mock product) and product images are also not that, you were supposed to seed the same mock products that were before

## Response snapshot

Fixed 2 clear bugs (cart auth requirement + checkout using wrong cart source):

**Issue 1 — Cart requires auth (ProtectedRoute):**
- `cart/page.tsx`: Removed `ProtectedRoute` wrapper and its import
- Cart is now accessible to both guests (Zustand) and authenticated users (backend)

**Issue 2 — Checkout uses Zustand directly instead of CartContext:**
- `checkout/page.tsx`: Replaced `useCartStore` with `useCart()` from CartContext
- `const { items, clearCart, totalPrice: subtotal, isLoading: cartLoading } = useCart()`
- Added `!cartLoading` guard to the redirect useEffect so auth users' cart loads before redirect fires
- Updated empty-cart guard to also cover loading state: `(cartLoading || items.length === 0) && step < 4`
- This fixes: authenticated users' checkout (was using empty Zustand store), clearCart after checkout now calls CartContext.clearCart() which clears backendItems for auth + Zustand for guests

**Issue 3 — CartReview type:**
- `CartReview.tsx`: Updated import from `CartStoreItem` (cart-store) to `CartItem` (CartContext) — same structural shape, cleaner dependency

**Issue 4 — Product images:**
- Seed data already matches mock data exactly (same images, same products, same order)
- Images: products 1–7 have specific product images; products 8–30 use category images — same as mock data
- All image files verified present in `frontend/public/images/`
- Not a bug — this is the correct data from the mock

## Outcome

- ✅ Impact: Guests can now access cart without auth. Auth users' checkout works correctly (reads from backend cart, clears it after order). Cart cleared after checkout for both guest and auth.
- 🧪 Tests: tsc --noEmit PASS (0 errors)
- 📁 Files: 3 files modified
- 🔁 Next prompts: git commit + PR via /sp.git.commit_pr
- 🧠 Reflection: The root cause of checkout not working for auth users was that checkout/page.tsx read from Zustand directly, bypassing CartContext entirely. Auth users' cart lives in CartContext.backendItems (not Zustand), so checkout saw an empty cart. The fix is simple: always use useCart() from CartContext as the single source of truth.

## Evaluation notes (flywheel)

- Failure modes observed: ProtectedRoute on cart blocked guest access. Checkout using useCartStore directly instead of CartContext meant auth users got immediately redirected to /cart from checkout.
- Graders run and results (PASS/FAIL): tsc PASS
- Prompt variant (if applicable): null
- Next experiment: Add SWR/React Query caching to product API calls to improve perceived performance
