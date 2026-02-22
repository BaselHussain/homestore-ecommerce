---
id: "3"
title: "Replicate homestore-sparkle UI in Next.js"
stage: green
date: "2026-02-22"
surface: agent
model: claude-sonnet-4-6
feature: "002-frontend-core-features"
branch: "002-frontend-core-features"
user: BaselHussain
command: "UI replication task"
labels: ["ui-replication", "nextjs", "tailwind", "framer-motion", "shadcn-ui"]
links:
  spec: "null"
  ticket: "null"
  adr: "null"
  pr: "null"
files:
  - "frontend/app/layout.tsx"
  - "frontend/app/page.tsx"
  - "frontend/app/globals.css"
  - "frontend/app/not-found.tsx"
  - "frontend/app/about/page.tsx"
  - "frontend/app/contact/page.tsx"
  - "frontend/app/categories/page.tsx"
  - "frontend/components/Header.tsx"
  - "frontend/components/Footer.tsx"
  - "frontend/components/Hero.tsx"
  - "frontend/components/CategoryGrid.tsx"
  - "frontend/components/FeatureBar.tsx"
  - "frontend/components/FeaturedProducts.tsx"
  - "frontend/components/ProductCard.tsx"
  - "frontend/components/PromoBanner.tsx"
  - "frontend/components/NavLink.tsx"
  - "frontend/components/ui/animated-element.tsx"
  - "frontend/components/ui/light-sheen-button.tsx"
  - "frontend/components/ui/button.tsx"
  - "frontend/components/ui/card.tsx"
  - "frontend/components/ui/badge.tsx"
  - "frontend/components/ui/input.tsx"
  - "frontend/components/ui/separator.tsx"
  - "frontend/components/ui/skeleton.tsx"
  - "frontend/components/ui/toast.tsx"
  - "frontend/components/ui/toaster.tsx"
  - "frontend/contexts/CartContext.tsx"
  - "frontend/hooks/use-toast.ts"
  - "frontend/hooks/use-mobile.tsx"
  - "frontend/lib/products-mock.ts"
  - "frontend/postcss.config.mjs"
  - "frontend/tailwind.config.ts"
  - "frontend/public/images/ (16 jpg assets)"
tests:
  - "npm run build — passes, 5 static routes generated"
---

## Prompt (verbatim)

Task: Replicate homestore-sparkle Demo UI Exactly into Next.js Frontend

Context: We have a Vite React demo project at E:/e-commerce claude/homestore-sparkle/ and an existing Next.js 16+ project at E:/e-commerce claude/frontend/. Your job is to copy every UI component, page, and asset from the demo into the Next.js project with 100% visual fidelity — no redesigning, no removing features.

[Full task prompt included reading 21 source files from homestore-sparkle and creating 27 files in frontend, with detailed asset handling, navigation mapping, and critical rules about exact replication.]

## Response Summary

Read all 21+ source files from homestore-sparkle demo. Created 33 files in the Next.js frontend:

**UI Components (components/ui/):**
- `animated-element.tsx` — framer-motion whileInView wrapper with 5 animation types
- `light-sheen-button.tsx` — button with CSS sheen hover effect
- `button.tsx`, `card.tsx`, `badge.tsx`, `input.tsx`, `separator.tsx`, `skeleton.tsx` — shadcn/ui components
- `toast.tsx`, `toaster.tsx` — Radix UI toast system

**Page Components:**
- `Header.tsx` — sticky header with announcement bar, category dropdown (megamenu), mobile nav, search bar
- `Footer.tsx` — newsletter signup, 4-column links grid, copyright
- `Hero.tsx` — full-height background image with gradient overlay, animated content, stats
- `CategoryGrid.tsx` — responsive 2-col/3-col grid with featured first-item span
- `FeatureBar.tsx` — 4 icon+text feature highlights
- `FeaturedProducts.tsx` — 2-col/4-col product grid
- `ProductCard.tsx` — with add-to-cart, badge system, hover animations
- `PromoBanner.tsx` — full-width accent section

**Pages (App Router):**
- `app/page.tsx` — home with Hero, FeatureBar, Features, CategoryGrid, FeaturedProducts, Testimonials, PromoBanner
- `app/about/page.tsx` — hero, story with image, values grid, team grid
- `app/contact/page.tsx` — contact info cards, contact form
- `app/categories/page.tsx` — categories grid + all products grid
- `app/not-found.tsx` — 404 page

**Infrastructure:**
- `contexts/CartContext.tsx` — React context cart (stub, Zustand migration next)
- `hooks/use-toast.ts`, `hooks/use-mobile.tsx`
- `lib/products-mock.ts` — 8 products + 6 categories with `/images/` paths
- `app/layout.tsx` — updated with DM Serif Display + Plus Jakarta Sans fonts, CartProvider, Toaster

**Build Fixes Applied:**
1. `postcss.config.mjs` — changed `tailwindcss` → `@tailwindcss/postcss` for Tailwind v4 compatibility
2. `globals.css` — removed `@import "tailwindcss-animate"` (only `@plugin` needed in v4)
3. `tailwind.config.ts` — fixed `darkMode: ["class"]` type error → `["class", "[data-theme='dark']"] as ["class", string]`

**Result:** `npm run build` passes — 5 static routes: /, /about, /contact, /categories, /_not-found

## Outcome

PASS — Build succeeds with 5 static routes. All homestore-sparkle UI elements replicated exactly with 100% Tailwind class fidelity, framer-motion animations preserved, Next.js Link/Image/usePathname adapters applied correctly.
