---
id: 0007
title: Frontend Image Resolution + CSV Bulk Import
stage: general
date: 2026-03-12
surface: agent
model: claude-sonnet-4-6
feature: none
branch: development
user: CW
command: implement plan
labels: ["frontend","image-resolution","bulk-import","csv","admin","backend"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - frontend/lib/utils.ts
  - frontend/lib/api.ts
  - frontend/next.config.ts
  - backend/src/routes/adminRouter.ts
  - admin/lib/api.ts
  - admin/app/bulk-import/page.tsx
  - admin/components/Sidebar.tsx
tests:
  - Upload product image in admin → frontend product card renders it
  - Existing /images/... seed images still render
  - Admin bulk import: upload CSV → preview → import → products appear
---

## Prompt

Implement the following plan:

# Plan: Frontend Image Resolution + CSV Bulk Import

Phase 1: Frontend image resolution — getImageUrl() helper in utils.ts, update mapProduct() in api.ts, add remotePatterns to next.config.ts.

Phase 2: Backend URL normalization + bulk import endpoint — normalizeImageUrl helper, update POST/PUT products, add POST /products/bulk endpoint.

Phase 3: Admin CSV Bulk Import — install papaparse, add bulkImportProducts to admin/lib/api.ts, create admin/app/bulk-import/page.tsx, add Bulk Import nav item to Sidebar.

## Response snapshot

Implemented all 8 steps:

1. `frontend/lib/utils.ts` — Added `getImageUrl()` that resolves `/uploads/...` paths using `NEXT_PUBLIC_API_BASE_URL`, passes through `/images/...` paths, and falls back to category-household.jpg
2. `frontend/lib/api.ts` — Imported `getImageUrl`, updated `mapProduct()` to call it on image and images array
3. `frontend/next.config.ts` — Added `remotePatterns` for localhost:5000 and https://** on `/uploads/**`
4. `backend/src/routes/adminRouter.ts` — Added `normalizeImageUrl()` helper, updated POST/PUT to normalize images, added `POST /products/bulk` endpoint before `/:id` routes
5. `admin` — Installed papaparse + @types/papaparse
6. `admin/lib/api.ts` — Added `bulkImportProducts` method
7. `admin/app/bulk-import/page.tsx` — Full page with drag-and-drop CSV upload, client-side papaparse parsing, validation, scrollable preview table with per-row error display, import button
8. `admin/components/Sidebar.tsx` — Added FileSpreadsheet icon import + Bulk Import nav item after Uploads

## Outcome

- ✅ Impact: Frontend now resolves uploaded product images to full URLs; admin panel supports 100+ product bulk import via CSV
- 🧪 Tests: Manual — upload image, verify frontend renders; upload CSV, verify preview and import flow
- 📁 Files: 7 files modified/created
- 🔁 Next prompts: Test the full image upload→frontend render flow; test bulk import with real Google Sheets CSV export
- 🧠 Reflection: normalizeImageUrl placed before /:id routes to avoid Express route conflict; getImageUrl handles all path types safely

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): manual
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): add progress bar for large CSV imports
