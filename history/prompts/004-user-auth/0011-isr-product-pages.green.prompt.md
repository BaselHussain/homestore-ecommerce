---
id: "0011"
title: Implement ISR for Product Pages
stage: green
date: 2026-02-28
surface: agent
model: claude-sonnet-4-6
feature: 004-user-auth
branch: main
user: CW
command: manual
labels: ["isr","performance","server-components","next-js","products","categories"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - frontend/lib/server-api.ts
  - frontend/components/FeaturedProducts.tsx
  - frontend/app/products/page.tsx
  - frontend/app/products/ProductsClientPage.tsx
  - frontend/app/categories/page.tsx
  - frontend/app/categories/[slug]/page.tsx
tests:
  - npx tsc --noEmit (frontend — 0 errors)
  - npx next build → all routes compiled, 5m ISR shown for /, /categories, /products, /categories/[slug]
---

## Prompt

cant we use ISR? for slowdown?

## Response snapshot

Implemented ISR (Incremental Static Regeneration) for all product listing pages:

**New `lib/server-api.ts`:**
- Uses native `fetch` with `next: { revalidate: 300 }` (5-minute cache)
- No axios, no browser APIs — safe for server components
- Includes standalone `mapProduct()` function (no dependency on auth-aware api.ts)

**`FeaturedProducts.tsx` → async server component:**
- Removed 'use client', useState, useEffect
- Direct `await serverGetProducts({ limit: 8 })` at render time
- ISR cache serves pre-built HTML — no client-side API call on homepage load

**Products page split into server + client:**
- `app/products/page.tsx`: Server component, fetches ALL products with `revalidate = 300`
- `app/products/ProductsClientPage.tsx`: Client component receives `initialProducts: Product[]`
- Filtering is now **local** (useMemo over initialProducts) — no API call on search/filter change
- Search/category filter is instant (zero network requests after initial load)

**Category pages → server components:**
- `categories/page.tsx`: async server component with `revalidate = 300`
- `categories/[slug]/page.tsx`: async server component with `generateStaticParams` for all 6 categories — pre-built as SSG at build time, `revalidate = 300` for updates
- Fixed Next.js 16 `params` breaking change: `params: Promise<{ slug: string }>` → `await params`

**Build output confirms ISR:**
```
/ (homepage)          5m revalidate
/categories           5m revalidate
/categories/[slug]    5m revalidate (SSG, 6 paths pre-built)
/products             5m revalidate
```

## Outcome

- ✅ Impact: Product pages now serve pre-built HTML from Next.js cache — no waterfall of API calls on page load. Search/filter is instant (local). Category pages pre-built at deploy time.
- 🧪 Tests: tsc PASS, next build PASS with ISR indicators confirmed
- 📁 Files: 1 new file (server-api.ts), 1 new file (ProductsClientPage.tsx), 4 modified
- 🔁 Next prompts: git commit + PR via /sp.git.commit_pr
- 🧠 Reflection: Key architectural insight — splitting server (data fetch with ISR) from client (interactive filter) lets us have both: fast initial load AND instant search without re-fetching. Next.js 16 changed `params` to be a Promise — must `await params` in server components with dynamic routes.

## Evaluation notes (flywheel)

- Failure modes observed: Next.js 16 `params` is now `Promise<{slug}>` — build failed on prerender of /categories/household-goods until `await params` was added
- Graders run and results (PASS/FAIL): tsc PASS, next build PASS
- Prompt variant (if applicable): null
- Next experiment: Add ISR to product detail page `/products/[id]`
