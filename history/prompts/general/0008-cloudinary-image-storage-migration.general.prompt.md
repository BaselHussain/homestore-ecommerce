---
id: "0008"
title: Cloudinary Image Storage Migration
stage: green
date: 2026-03-13
surface: agent
model: claude-sonnet-4-6
feature: none
branch: development
user: CW
command: implement plan
labels: ["cloudinary","uploads","images","backend","frontend","migration"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/src/routes/uploadsRouter.ts
  - backend/.env
  - backend/.env.example
  - frontend/next.config.ts
  - frontend/lib/utils.ts
tests:
  - manual: upload image in admin → URL starts with https://res.cloudinary.com
  - manual: frontend product card renders Cloudinary URL
  - manual: delete image in admin → removed from Cloudinary dashboard
---

## Prompt

Implement the Cloudinary Image Storage Migration plan (replacing local disk uploads with Cloudinary CDN storage).

## Response snapshot

Migrated image uploads from local disk (`backend/public/uploads/`) to Cloudinary:

1. **Installed** `cloudinary` npm package in backend.
2. **Added env vars** `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` to `backend/.env` and `.env.example`.
3. **Rewrote `uploadsRouter.ts`**: replaced `multer.diskStorage` with `multer.memoryStorage()`, added `uploadToCloudinary()` helper using `upload_stream`, updated DELETE to use `cloudinary.uploader.destroy()`, updated GET to use `cloudinary.api.resources()`.
4. **Updated `frontend/next.config.ts`**: removed `rewrites()` proxy, added `res.cloudinary.com` remotePattern for `next/image`.
5. **Cleaned up `frontend/lib/utils.ts`**: removed stale comment about `/uploads/` proxy.

TypeScript compiles cleanly (`tsc --noEmit` passes).

## Outcome

- ✅ Impact: Images now stored on Cloudinary CDN — permanent HTTPS URLs, no private-IP proxy, no disk loss risk on hPanel
- 🧪 Tests: Manual verification required (Cloudinary credentials must be added to .env)
- 📁 Files: 5 files modified
- 🔁 Next prompts: Add Cloudinary credentials to backend/.env; verify upload flow in admin; test product image rendering on frontend
- 🧠 Reflection: DELETE endpoint uses base64-encoded public_id param to handle Cloudinary's slash-separated folder paths in route params

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): tsc --noEmit PASS
- Prompt variant (if applicable): none
- Next experiment: none
