---
id: "0009"
title: Cloudinary Migration Testing and Fixes
stage: green
date: 2026-03-13
surface: agent
model: claude-sonnet-4-6
feature: none
branch: development
user: CW
command: test and fix cloudinary flow
labels: ["cloudinary","uploads","images","bugfix","backend","admin"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/src/routes/uploadsRouter.ts
  - backend/src/routes/adminRouter.ts
  - backend/src/server.ts
  - frontend/lib/utils.ts
  - admin/app/uploads/page.tsx
  - admin/lib/api.ts
  - admin/package.json
tests:
  - manual: upload image → success toast + Cloudinary URL returned
  - manual: delete image → success toast + removed from uploads grid + removed from product DB
  - manual: frontend product page → shows placeholder after image deleted
---

## Prompt

Test and fix the Cloudinary image storage migration flow.

## Response snapshot

Fixed multiple issues discovered during testing:

1. **normalizeImageUrl stripping Cloudinary URLs** — `adminRouter.ts` had `normalizeImageUrl` that extracted only the pathname from full URLs, corrupting Cloudinary URLs on product save. Fixed to return URL as-is.
2. **"Failed to delete image" toast** — Raw SQL used wrong table name `"Product"` (should be `"products"`) and used PostgreSQL array syntax on a `Json` field. Fixed with `jsonb_agg` + `jsonb_array_elements_text`.
3. **DB not cleaned up on image delete** — After deleting from Cloudinary, product records still held the old URL. Fixed with non-blocking `$executeRawUnsafe` cleanup query.
4. **Backend crashing on Neon connection drops** — Added `unhandledRejection` and `uncaughtException` handlers to keep server alive.
5. **Delete button double-click** — Added `deleting` state to disable button and show spinner during deletion.
6. **Frontend stale cache** — Deleted `.next` cache folders on both frontend and admin to force rebuild after config changes.
7. **admin dev port** — Added `--port 3001` to admin `package.json` dev script.

## Outcome

- ✅ Impact: Full Cloudinary upload/delete flow working end-to-end
- 🧪 Tests: Manual verification passed for upload, delete, DB cleanup, frontend placeholder
- 📁 Files: 7 files modified
- 🔁 Next prompts: Update existing products with Cloudinary URLs; bulk import with Cloudinary images
- 🧠 Reflection: JSON vs array field type mismatch was the root cause of the DB cleanup failure — always check Prisma schema field types before writing raw SQL

## Evaluation notes (flywheel)

- Failure modes observed: Wrong table name in raw SQL, JSON vs array type mismatch, normalizeImageUrl silently corrupting URLs
- Graders run and results (PASS/FAIL): Manual E2E PASS
- Prompt variant (if applicable): none
- Next experiment: none
