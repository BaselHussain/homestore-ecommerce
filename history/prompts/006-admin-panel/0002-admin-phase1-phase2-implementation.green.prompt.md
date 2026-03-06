---
id: "0002"
title: Admin Phase 1 and Phase 2 Implementation
stage: green
date: 2026-03-03
surface: agent
model: claude-sonnet-4-6
feature: 006-admin-panel
branch: 006-admin-panel
user: user
command: implement phase1 phase2 admin panel
labels: ["admin", "nextjs", "backend", "prisma", "framer-motion", "shadcn", "auth"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - admin/lib/framerVariants.ts
  - admin/lib/api.ts
  - admin/lib/utils.ts (already existed from shadcn)
  - admin/contexts/AdminAuthContext.tsx
  - admin/components/Sidebar.tsx
  - admin/components/AdminShell.tsx
  - admin/app/layout.tsx
  - admin/app/page.tsx
  - admin/app/login/page.tsx
  - backend/src/middlewares/adminOnly.ts
  - backend/src/routes/adminRouter.ts
  - backend/src/routes/auth.ts
  - backend/src/routes/users.ts
  - backend/src/server.ts
  - backend/prisma/schema.prisma
tests:
  - npx tsc --noEmit (admin) - PASS
  - npx tsc --noEmit (backend) - PASS
  - npx prisma db push - PASS
---

## Prompt

You are implementing the admin panel for a Homestore e-commerce project. The admin panel is a SEPARATE Next.js 16 app located at `E:/e-commerce claude/admin/`. The backend is at `E:/e-commerce claude/backend/`.

## YOUR JOB: Implement Phase 1 + Phase 2 tasks

Phase 1: Setup (T001-T004) — install deps, create folders, framerVariants, api.ts
Phase 2: Foundational (T005-T009, T016-T020) — AdminAuthContext, backend middleware, Sidebar, AdminShell, layout, login page, prisma schema update

## Response snapshot

### Phase 1 completed:
- T001: Installed framer-motion, recharts, jspdf, @types/jspdf, next-themes, sonner, lucide-react, clsx, tailwind-merge, class-variance-authority, axios
- T001b: shadcn/ui initialized with `npx shadcn@latest init --yes --defaults`, created lib/utils.ts
- T001c: shadcn components added: button, card, table, badge, dialog, sheet, select, separator, skeleton, sonner
- T002: Created all required directories: components/Charts, lib, contexts, app/login, app/products, app/orders, app/users, app/analytics, app/invoices
- T003: Created `admin/lib/framerVariants.ts` with typed Variants using bezier curve arrays for `ease` (fixes strict framer-motion typing)
- T004: Created `admin/lib/api.ts` with axios instance, JWT interceptor, 401 redirect, and adminApi with stats/products/orders/users/analytics/invoices methods

### Phase 2 completed:
- T005: Created `admin/contexts/AdminAuthContext.tsx` with AdminAuthProvider and useAdminAuth hook
- T006: Created `backend/src/middlewares/adminOnly.ts` using decodeAccessToken from lib/security (matches backend pattern). Created `backend/src/routes/adminRouter.ts` with all stub admin endpoints: stats, products CRUD, orders, users ban, analytics, invoices. Updated `backend/src/server.ts` to import adminRouter and mount at /api/admin, updated CORS to allow admin origin
- T007: Created `admin/components/Sidebar.tsx` with animated collapse/expand using framer-motion sidebarVariants
- T008: Updated `admin/app/layout.tsx` with ThemeProvider, AdminAuthProvider, AdminShell, Toaster. Created `admin/components/AdminShell.tsx` with auth guard redirect to /login
- T009: Verified `admin/lib/utils.ts` already created by shadcn init with correct cn() function
- T016: Added `role String @default("customer")` and `isBanned Boolean @default(false)` to User model in schema.prisma. Ran `npx prisma db push` successfully
- T017: Updated `backend/src/routes/auth.ts` login endpoint to include `role` in response and block banned users. Added `GET /auth/me` endpoint returning user with role
- T018/T019: Handled by AdminAuthContext (T005) and AdminShell (T008)
- T020: Created `admin/app/login/page.tsx` with framer-motion animation and sonner toasts
- Bonus: Created `admin/app/page.tsx` dashboard with stats cards
- Pre-existing bug fix: Removed `order.updated_at` reference in `backend/src/routes/users.ts` (field doesn't exist on Order model)

### TypeScript verification:
- Admin: `npx tsc --noEmit` — 0 errors
- Backend: `npx tsc --noEmit` — 0 errors
- Key fix: framerVariants.ts uses `Variants` type import and bezier arrays `[0.25, 0.1, 0.25, 1]` instead of string `'easeOut'` for strict framer-motion type compatibility

## Outcome

- Impact: Admin panel Phase 1 and Phase 2 fully implemented — separate Next.js 16 app with auth, sidebar, shell layout, login page, and dashboard stub. Backend extended with admin middleware, all CRUD admin routes, schema migration.
- Tests: TypeScript compilation passes with 0 errors on both admin and backend projects
- Files: 15 files created/modified across admin and backend
- Next prompts: Phase 3 — implement Products management page (CRUD table), Orders page, Users management, Analytics charts with Recharts, Invoices with PDF export
- Reflection: The framer-motion Variants type required importing from framer-motion and using cubic-bezier arrays instead of string ease names. The backend middleware directory is `middlewares` (plural) not `middleware` — confirmed by reading the existing structure before creating files.

## Evaluation notes (flywheel)

- Failure modes observed: framer-motion strict TypeScript typing required Variants import and bezier arrays instead of string ease values
- Graders run and results (PASS/FAIL): TypeScript compilation PASS on both projects
- Prompt variant (if applicable): null
- Next experiment: Test that the login page correctly routes to /login when no token, and dashboard loads stats after admin login
