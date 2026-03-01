---
id: "0009"
title: Connect Products Cart Wishlist to Backend
stage: green
date: 2026-02-27
surface: agent
model: claude-sonnet-4-6
feature: 004-user-auth
branch: 004-user-auth
user: CW
command: manual
labels: ["products","cart","wishlist","neon-db","seed","hybrid-context","api"]
links:
  spec: specs/004-user-auth/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - backend/prisma/schema.prisma
  - backend/prisma/seed.ts
  - frontend/lib/api.ts
  - frontend/lib/types.ts
  - frontend/lib/products-mock.ts
  - frontend/contexts/CartContext.tsx
  - frontend/contexts/WishlistContext.tsx
  - frontend/app/layout.tsx
  - frontend/app/products/page.tsx
  - frontend/app/products/[id]/page.tsx
  - frontend/app/categories/page.tsx
  - frontend/app/categories/[slug]/page.tsx
  - frontend/app/cart/page.tsx
  - frontend/app/wishlist/page.tsx
  - frontend/components/FeaturedProducts.tsx
  - frontend/components/ProductCard.tsx
  - frontend/components/CategoryGrid.tsx
  - frontend/components/Header.tsx
tests:
  - npx tsc --noEmit (backend — 0 errors)
  - npx tsc --noEmit (frontend — 0 errors)
  - npx next build → all 17 routes compiled
  - npx prisma migrate dev --name add-product-display-fields → migration applied
  - npm run db:seed → 30 products seeded to Neon DB
---

## Prompt

yes, connect products, cart, and wishlist to the backend, and i also want that the products should come from neon database not from frontend variables

## Response snapshot

Connected all three features to the backend/Neon DB:

**Backend schema:**
- Added display fields to Product model: `originalPrice Decimal?`, `badge String?`, `rating Decimal?`, `reviews Int?`, `itemCode String?`
- Migration: `add-product-display-fields` applied to Neon DB
- Rewrote `prisma/seed.ts` with all 30 products from mock data (using `/images/` paths, full descriptions, all display fields)
- Seeded 30 products to Neon DB

**Frontend API layer:**
- Added `mapProduct(raw)` in `api.ts`: converts backend Decimal/Json fields to display type (parseFloat price/originalPrice/rating, `images[0]` → `image`, camelCase field names)
- Updated `productsApi.getAll()` and `getById()` to use mapper — returns `products-mock.ts Product` display type
- Added `cartApi.remove(cartItemId)` and `cartApi.update(cartItemId, quantity)`
- Added `wishlistApi.remove(wishlistItemId)`
- Consolidated `types.ts` to re-export `Product` from `products-mock.ts` (removed type conflict)

**Hybrid CartContext (backend for auth, Zustand for guests):**
- Fetches backend cart on auth, maintains `productId → cartItemDbId` map for remove/update operations
- `addToCart/removeFromCart/updateQuantity`: calls API if authenticated, Zustand if guest
- Header cart count + cart page both work in both modes

**New WishlistContext (hybrid auth/guest):**
- Fetches backend wishlist on auth, maintains `productId → wishlistItemDbId` map
- `addItem/removeItem/isInWishlist`: API if authenticated, Zustand if guest
- Added `WishlistProvider` to `app/layout.tsx`

**Products pages updated to use API:**
- `products/page.tsx`: calls `productsApi.getAll()` with search/category params
- `products/[id]/page.tsx`: calls `productsApi.getById()`, fetches related from same category
- `categories/page.tsx`: fetches all products from API
- `categories/[slug]/page.tsx`: fetches by category from API
- `FeaturedProducts.tsx`: fetches from API (converted to client component)

**ProductCard + Header updated:**
- `ProductCard.tsx`: uses `useWishlist()` from WishlistContext instead of `useWishlistStore`
- `Header.tsx`: uses `useWishlist()` for count; removed mock `products` import; mega menu now shows category links without broken individual product links
- `CategoryGrid.tsx`: uses `cat.productCount` instead of mock product count

## Outcome

- ✅ Impact: Products now come from Neon DB (30 seeded). Cart and wishlist use backend API for authenticated users, Zustand for guests.
- 🧪 Tests: tsc PASS (backend + frontend), next build PASS (17 routes), migration + seed PASS
- 📁 Files: 18 files created/modified across backend and frontend
- 🔁 Next prompts: git commit + PR via /sp.git.commit_pr
- 🧠 Reflection: Key challenge was the dual Product type in types.ts vs products-mock.ts — solved by making types.ts re-export from products-mock.ts. Hybrid cart/wishlist requires a productId→dbItemId map since CartItemRow calls remove/update by product ID but backend needs DB item ID.

## Evaluation notes (flywheel)

- Failure modes: Type conflict between types.ts Product and products-mock.ts Product fixed by consolidation. Backend mega menu product links had wrong IDs — removed in favor of category links only.
- Graders: tsc PASS, next build PASS, 30 products in Neon DB
- Next experiment: Add optimistic updates to cart/wishlist operations for snappier UX
