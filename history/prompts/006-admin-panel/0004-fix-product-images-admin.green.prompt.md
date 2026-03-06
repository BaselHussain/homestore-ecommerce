---
id: "0004"
title: Fix product images not visible in admin
stage: green
date: 2026-03-03
surface: agent
model: claude-sonnet-4-6
feature: 006-admin-panel
branch: 006-admin-panel
user: CW
command: sp.implement (continuation)
labels: ["bug-fix","images","admin-panel","cross-origin"]
links:
  spec: specs/006-admin-panel/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - admin/.env.local
  - admin/lib/utils.ts
  - admin/app/products/page.tsx
tests:
  - "Visual: product images render in /products table"
---

## Prompt

products images are not visible in admin panel in products tab

(Session continuation — completing fix started before context compaction)

## Response snapshot

Root cause: seed data stores relative image paths (`/images/product-pots-set.jpg`). These are served by the Next.js frontend on port 3000. The admin panel runs on port 3001 and cannot resolve relative paths to the frontend.

Fix applied in three steps:
1. Created `admin/.env.local` with `NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000`
2. Added `resolveImageUrl(url: string): string` to `admin/lib/utils.ts` — prefixes relative URLs with the frontend origin; passes through absolute URLs unchanged
3. Updated `admin/app/products/page.tsx` `<img>` tag: `src={resolveImageUrl(firstImage(p))}`

## Outcome

- ✅ Impact: Product images now load correctly in the admin products table by resolving relative paths to the frontend origin
- 🧪 Tests: Manual visual verification — images in /products table should render from http://localhost:3000/images/...
- 📁 Files: admin/.env.local, admin/lib/utils.ts, admin/app/products/page.tsx
- 🔁 Next prompts: Check if other admin pages (e.g. orders detail, dashboard) also display product images and apply same fix if needed
- 🧠 Reflection: Cross-origin image resolution is a common issue in multi-app monorepos. Centralizing it in `resolveImageUrl()` makes it easy to reuse across admin pages.

## Evaluation notes (flywheel)

- Failure modes observed: Import added but `<img src>` usage not updated before context compaction — fix was incomplete
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): null
- Next experiment: Consider applying resolveImageUrl to any other admin pages that show product images
