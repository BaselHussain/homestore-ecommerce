---
id: "0007"
title: Phase 6 Polish Security Error Boundaries
stage: green
date: 2026-02-27
surface: agent
model: claude-sonnet-4-6
feature: 004-user-auth
branch: 004-user-auth
user: CW
command: /sp.implement (phase 6)
labels: ["security","helmet","error-boundary","skeleton","polish"]
links:
  spec: specs/004-user-auth/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - backend/src/server.ts
  - frontend/components/AuthErrorBoundary.tsx
  - frontend/components/ProtectedRoute.tsx
  - specs/004-user-auth/tasks.md
tests:
  - npx tsc --noEmit (backend — 0 errors)
  - npx tsc --noEmit (frontend — 0 errors)
---

## Prompt

what about phase 6? yes, implement all three

## Response snapshot

Implemented T051, T052, T053:

**T051 — Security headers (helmet):**
- Installed `helmet` npm package in backend
- Added `app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))` before all middleware in `server.ts`
- Tightened CORS: now passes `origin: FRONTEND_URL` and `credentials: true` instead of open `cors()`

**T052 — Error boundary (AuthErrorBoundary):**
- Created `frontend/components/AuthErrorBoundary.tsx` as a React class component (required for error boundaries)
- Shows AlertTriangle icon, "Try again" button (resets state) and "Go home" link on error
- Integrated directly into `ProtectedRoute` so all protected pages (cart, wishlist, profile) get it automatically

**T053 — Skeleton screens:**
- Replaced bare spinner in `ProtectedRoute` loading state with a full `PageSkeleton` component
- Skeleton mirrors the page layout: header bar + 6-card grid, all animated via `animate-pulse`
- Shows during the auth check window before redirect or content render

All 62 tasks across 6 phases now marked complete. Both TypeScript compilations clean (0 errors).

## Outcome

- ✅ Impact: Security hardened (helmet adds X-Content-Type-Options, X-Frame-Options, HSTS, etc.), auth component failures caught and surfaced gracefully, loading states polished with page-shaped skeletons
- 🧪 Tests: tsc --noEmit PASS (backend and frontend)
- 📁 Files: 3 source files created/modified + tasks.md updated
- 🔁 Next prompts: git commit + PR via /sp.git.commit_pr
- 🧠 Reflection: Integrating AuthErrorBoundary into ProtectedRoute itself (vs each page) is the DRY approach — one change covers all current and future protected routes.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): tsc PASS (backend), tsc PASS (frontend)
- Prompt variant (if applicable): phase 6 polish
- Next experiment: Add Suspense-based skeleton at layout level for even earlier display
