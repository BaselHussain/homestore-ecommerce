# Frontend Enhancer Agent Memory

## Project: homestore-ecommerce

### Tech Stack
- Next.js 16 (app router), React 19, TypeScript
- Tailwind CSS v4 (uses `@theme` block, NOT tailwind.config.js)
- shadcn/ui components in `frontend/components/ui/`
- Zod v4: import as `import { z } from 'zod'` (NOT `import * as z`)
- @hookform/resolvers v5 works with zodResolver normally
- Zustand v5 with persist middleware for localStorage stores
- framer-motion v12, lucide-react v0.575

### Key File Paths
- `frontend/app/layout.tsx` — CartProvider wraps everything
- `frontend/contexts/CartContext.tsx` — wraps Zustand store, backward-compat with `useCart()`
- `frontend/lib/cart-store.ts` — Zustand cart store (homestore-cart localStorage key)
- `frontend/lib/wishlist-store.ts` — Zustand wishlist store (homestore-wishlist key)
- `frontend/lib/products-mock.ts` — Product and Category types + mock data
- `frontend/lib/types.ts` — API types (Product, CartItem, Order, ShippingAddress, etc.)
- `frontend/lib/api.ts` — axios client for backend at localhost:5000/api
- `frontend/lib/utils.ts` — cn() and formatPrice() helpers
- `frontend/components/ui/` — button, card, badge, input, separator, skeleton, toast, toaster, animated-element, light-sheen-button, label, textarea, select, checkbox, form

### CSS Theme Variables
- Primary: hsl(25, 90%, 52%) — orange
- font-display: DM Serif Display (headings)
- font-body: Plus Jakarta Sans (body)
- All CSS vars in `globals.css` under `@theme {}` AND `:root {}` (dual format for compatibility)
- Light sheen effect: `before:content-[''] before:absolute before:top-0 before:left-[-100%]...hover:before:left-[100%]`

### Product Type (products-mock.ts)
```ts
{ id, name, price, originalPrice?, image, category, badge?, rating, reviews, itemCode }
```
Product routes use `/product/[id]` for legacy demo, `/products/[id]` for new e-commerce pages.

### Patterns
- All client components: `'use client'` at top
- `@/` import alias used throughout
- ProductCard uses both CartContext (via useCart) and WishlistStore directly
- Header uses `useCart()` for totalItems + `useWishlistStore` selector for wishlist count
- Checkout is multi-step (1=review, 2=shipping, 3=payment, 4=confirm), all on single `/checkout` page
- Breadcrumbs use ChevronRight icon with Link components
- Empty states use relevant icons (ShoppingBag, Heart, Package) with centered layout

### Routing
- `/products` — product listing with search + category filter
- `/products/[id]` — PDP with zoom, cart, wishlist
- `/cart` — cart page (Zustand store, no API)
- `/checkout` — multi-step checkout (4 steps, simulated payment)
- `/wishlist` — wishlist page

### Notes
- `use(params)` required for Next.js 16 dynamic route params (they're Promises)
- Products page wraps content in `<Suspense>` because `useSearchParams()` requires it
- ShippingForm uses react-hook-form + zodResolver + Form/FormField from `components/ui/form.tsx`
- See `patterns.md` for detailed component patterns
