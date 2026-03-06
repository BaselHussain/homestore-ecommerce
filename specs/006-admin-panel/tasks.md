---
description: "Task list for Admin Panel feature implementation"
---

# Tasks: Admin Panel

**Input**: Design documents from `/specs/006-admin-panel/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The feature spec does not explicitly request test implementation, so tests are NOT included in these tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Web app: `backend/src/`, `frontend/`
- Paths adjusted based on plan.md structure

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure
**Note**: Admin is a separate Next.js 16 app at root `admin/` directory, completely isolated from `frontend/`.

- [X] T001 Install admin dependencies in admin/: framer-motion, recharts, jspdf, @types/jspdf, shadcn/ui, next-themes, sonner
- [X] T002 [P] Create admin components folder structure: admin/components/Charts/
- [X] T003 Create reusable animation variants in admin/lib/framerVariants.ts
- [X] T004 Create admin API client for backend calls in admin/lib/api.ts

---
## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 [P] Create admin auth context for role check in admin/contexts/AdminAuthContext.tsx
- [X] T006 [P] Create backend admin router entry point in backend/src/routes/adminRouter.ts with adminOnly middleware
- [X] T007 [P] Create admin sidebar component with navigation tabs in admin/components/Sidebar.tsx
- [X] T008 Update root admin layout in admin/app/layout.tsx with sidebar + theme provider
- [X] T009 Create AdminShell auth guard component in admin/components/AdminShell.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Admin dashboard overview (Priority: P1) 🎯 MVP

**Goal**: Implement admin dashboard showing key business metrics including total sales, order status counts, registered users, and low stock alerts

**Independent Test**: Can be fully tested by logging into the admin dashboard as an admin user and verifying that the dashboard page displays summary statistics for sales, orders, users, and low stock products. This provides immediate business value by giving admins a quick snapshot of operations.

### Implementation for User Story 1

- [X] T010 [P] Create dashboard page in admin/app/page.tsx with animated layout
- [X] T011 [P] [US1] Dashboard stats cards (sales today/week/month, order status, users)
- [X] T012 [US1] Enhanced stats API endpoint in backend/src/routes/adminRouter.ts
- [X] T013 [US1] Connect dashboard to /api/admin/stats with loading states
- [X] T014 [US1] Display recent orders table (last 10) with animated rows
- [X] T015 [US1] Framer Motion animations for dashboard stat cards and low stock panel

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Admin authentication and role management (Priority: P1)

**Goal**: Ensure that only users with admin role can access the admin dashboard and its features

**Independent Test**: Can be fully tested by attempting to access the admin dashboard with different user types (admin, regular user, unauthenticated) and verifying that only admin users can access the dashboard while others are redirected to login or home pages.

### Implementation for User Story 2

- [X] T016 [P] [US2] Add isBanned field and admin role to User model in backend/prisma/schema.prisma
- [X] T017 [P] [US2] Create adminOnly middleware in backend/src/middlewares/adminOnly.ts
- [X] T018 [US2] Update AdminAuthContext to check admin role and redirect non-admins
- [X] T019 [US2] Wrap all admin app pages with admin auth guard (AdminShell)
- [X] T020 [US2] Add admin login page at admin/app/login/page.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Products management (Priority: P2)

**Goal**: Allow admin users to manage the product catalog including viewing, adding, editing, and deleting products

**Independent Test**: Can be fully tested by navigating to the products management page in the admin dashboard and verifying that products can be listed, searched, added, edited, and deleted with appropriate UI feedback and data persistence.

### Implementation for User Story 3

- [X] T021 [P] [US3] Create products page in admin/app/products/page.tsx
- [X] T022 [P] [US3] Products CRUD API endpoints in backend/src/routes/adminRouter.ts
- [X] T023 [US3] Products table with search/filter and animated rows
- [X] T024 [US3] Create product add/edit form in admin/components/ProductForm.tsx
- [X] T025 [US3] Product deletion with animated confirmation modal
- [X] T026 [US3] Image URL input handling with 5 image limit validation
- [X] T027 [US3] Product form with category, badge, itemCode, originalPrice fields

**Checkpoint**: At this point, User Stories 1, 2 AND 3 should all work independently

---

## Phase 6: User Story 4 - Orders management (Priority: P2)

**Goal**: Allow admin users to view and manage all orders in the system including changing order status and viewing order details

**Independent Test**: Can be fully tested by navigating to the orders management page and verifying that all orders are displayed in a table, order details can be viewed, and order status can be updated with appropriate system responses.

### Implementation for User Story 4

- [X] T028 [P] [US4] Create orders page in admin/app/orders/page.tsx
- [X] T029 [P] [US4] Orders management API endpoints in backend/src/routes/adminRouter.ts
- [X] T030 [US4] Orders table with status badges and animated rows
- [X] T031 [US4] Order details modal with Framer Motion open/close animation
- [X] T032 [US4] Order status change with logical transition validation
- [X] T033 [US4] Refund simulation button (marks order status as refunded)

**Checkpoint**: At this point, User Stories 1, 2, 3 AND 4 should all work independently

---

## Phase 7: User Story 5 - Users management (Priority: P3)

**Goal**: Allow admin users to view and manage user accounts including viewing user details and managing user permissions

**Independent Test**: Can be fully tested by navigating to the users management page and verifying that users can be listed, user details can be viewed, and user permissions can be modified appropriately.

### Implementation for User Story 5

- [X] T034 [P] [US5] Create users page in admin/app/users/page.tsx
- [X] T035 [P] [US5] Users management API endpoints in backend/src/routes/adminRouter.ts
- [X] T036 [US5] Users table with ban/unban buttons and animated rows
- [X] T037 [US5] User details modal showing account info
- [X] T038 [US5] Add isBanned check to auth middleware to block banned users

**Checkpoint**: At this point, User Stories 1, 2, 3, 4 AND 5 should all work independently

---

## Phase 8: User Story 6 - Analytics and reporting (Priority: P3)

**Goal**: Allow admin users to view visual analytics and reports about sales trends, top products, and business metrics

**Independent Test**: Can be fully tested by navigating to the analytics section and verifying that various charts and graphs render correctly with accurate data about sales, products, and user growth.

### Implementation for User Story 6

- [X] T039 [P] [US6] Create analytics page in admin/app/analytics/page.tsx
- [X] T040 [P] [US6] Analytics API endpoint in backend/src/routes/adminRouter.ts
- [X] T041 [US6] Create sales line chart in admin/components/Charts/SalesLineChart.tsx
- [X] T042 [US6] Create top products bar chart in admin/components/Charts/TopProductsChart.tsx
- [X] T043 [US6] Create order status pie chart in admin/components/Charts/OrderStatusChart.tsx
- [X] T044 [US6] Create revenue trend area chart in admin/components/Charts/UserGrowthChart.tsx
- [X] T045 [US6] Period selector (7d/30d/90d) and summary cards on analytics page

**Checkpoint**: At this point, User Stories 1, 2, 3, 4, 5 AND 6 should all work independently

---

## Phase 9: User Story 7 - Invoices generation (Priority: P4)

**Goal**: Allow admin users to generate and download invoices for business reporting and tax purposes

**Independent Test**: Can be fully tested by navigating to the invoices section and verifying that invoices can be generated for different time periods with correct data and downloaded in PDF format.

### Implementation for User Story 7

- [X] T046 [P] [US7] Create invoices page in admin/app/invoices/page.tsx
- [X] T047 [P] [US7] Invoices API endpoint with date filter in backend/src/routes/adminRouter.ts
- [X] T048 [US7] Create invoice generator component in admin/components/InvoicesGenerator.tsx with date picker
- [X] T049 [US7] PDF generation with jsPDF for invoice download
- [X] T050 [US7] Manual tax entry (percentage or fixed amount) in invoice form
- [X] T051 [US7] Invoice preview before download showing totals

**Checkpoint**: At this point, all user stories should now be independently functional

---

## Phase 10: User Story 8 - Admin UI and user experience (Priority: P4)

**Goal**: Provide a responsive, animated, and professional admin interface with dark/light theme support

**Independent Test**: Can be fully tested by navigating through the admin dashboard and verifying that page transitions, sidebar animations, and UI interactions work smoothly with appropriate loading states and visual feedback.

### Implementation for User Story 8

- [X] T052 [P] [US8] Dark/light theme toggle in sidebar using next-themes
- [X] T053 [P] [US8] Page transition animations via AnimatePresence in AdminShell
- [X] T054 [US8] Sidebar collapse/expand with smooth Framer Motion animation
- [X] T055 [US8] Modal open/close animations on all modals (Framer Motion)
- [X] T056 [US8] Scroll-triggered fade-in animations for cards and table rows
- [X] T057 [US8] Loading spinners throughout the admin interface

**Checkpoint**: All user stories should now be independently functional

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T058 [P] Navigation links include all admin pages in Sidebar.tsx
- [X] T059 [P] All pages follow consistent admin design patterns
- [X] T060 Error handling and user feedback (sonner toasts) throughout admin interface
- [ ] T061 Add audit logging for critical admin actions (deletions, status changes, user bans)
- [ ] T062 Run quickstart validation to ensure all features work together
- [ ] T063 Update any necessary documentation

---

## Phase 12: Sidebar Stubs (Missing Routes)

**Purpose**: Pages listed in sidebar nav that were not covered by user stories

- [X] T064 Create settings page at admin/app/settings/page.tsx — account info, theme picker (Light/Dark/System), system info
- [X] T065 Create categories page at admin/app/categories/page.tsx — live category breakdown with animated progress bars derived from product data
- [X] T066 Create coupons page at admin/app/coupons/page.tsx — coming soon page with planned feature cards

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in priority order (P1 → P2 → P3 → P4)
  - Or sequentially in priority order (P1 → P2 → P3 → P4)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 5 (P3)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 6 (P3)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 7 (P4)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 8 (P4)**: Can start after other stories (enhances all user stories)

### Within Each User Story

- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, user stories can proceed in priority order
- Tasks within each user story marked [P] can run in parallel

---

## Implementation Strategy

### MVP First (User Stories 1-2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Dashboard)
4. Complete Phase 4: User Story 2 (Authentication)
5. **STOP and VALIDATE**: Test User Stories 1-2 independently - This is the MVP
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Dashboard) → Test independently → Deploy/Demo
3. Add User Story 2 (Auth) → Test independently → Deploy/Demo
4. Add User Story 3 (Products) → Test independently → Deploy/Demo
5. Add User Story 4 (Orders) → Test independently → Deploy/Demo
6. Add User Story 5 (Users) → Test independently → Deploy/Demo
7. Add User Story 6 (Analytics) → Test independently → Deploy/Demo
8. Add User Story 7 (Invoices) → Test independently → Deploy/Demo
9. Add User Story 8 (UI/UX) → Test independently → Deploy/Demo

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
