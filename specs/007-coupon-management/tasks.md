# Tasks: Coupon Management System

**Input**: Design documents from `/specs/007-coupon-management/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅ | quickstart.md ✅

**Tests**: Not requested — no automated test tasks included.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Extend the existing project with coupon infrastructure — no new apps created.

- [x] T001 Add `Coupon` model to `backend/prisma/schema.prisma` per data-model.md (10 fields: id, code, discount_type, discount_value, min_order_value, max_usage_count, usage_count, is_active, expires_at, created_at)
- [x] T002 Extend `Order` model in `backend/prisma/schema.prisma` with two nullable fields: `coupon_code String? @map("couponCode")` and `discount_amount Decimal? @db.Decimal(10,2) @map("discountAmount")`
- [x] T003 Run `npx prisma migrate dev --name add-coupon-management` in `backend/` to generate and apply the migration
- [x] T004 [P] Create `backend/src/routes/coupons.ts` as a skeleton file with Express Router exported (empty, routes added in later phases)
- [x] T005 [P] Register coupon routes in `backend/src/server.ts`: mount `couponsRouter` at `/api/coupons` (public) and `/api/admin/coupons` (admin-auth protected)

**Checkpoint**: DB has `coupons` table and `orders` table has two new nullable columns. Route file exists. Server registers the routes.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No additional foundational work beyond Phase 1 — the Prisma migration and route registration ARE the foundation. All user stories can now proceed.

**⚠️ CRITICAL**: Phase 1 must be fully complete before any user story implementation starts.

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 — Customer Applies Coupon at Checkout (Priority: P1) 🎯 MVP

**Goal**: Customer enters a coupon code at checkout, sees discount deducted from order total, and the coupon is applied when order is placed (with server-side re-validation and usage count tracking).

**Independent Test**: Enter coupon code `TEST10` (10% off, no min order, no expiry) at `/checkout` Step 1 → discount line appears → complete order → verify order in admin shows `coupon_code: TEST10` and reduced total.

### Implementation for User Story 1

- [x] T006 [US1] Implement `POST /api/coupons/validate` in `backend/src/routes/coupons.ts` — accepts `{ code, subtotal }`, normalises code to uppercase, runs all 5 validation checks (active, not expired, usage limit, min order value), returns `{ valid, discountType, discountValue, discountAmount, finalTotal }` or `{ valid: false, error, message }` per contracts/api.md
- [x] T007 [US1] Modify `POST /api/orders` handler in `backend/src/routes/orders.ts` to: (a) accept optional `couponCode` and `discountAmount` in request body; (b) if `couponCode` present, re-validate server-side using same logic as T006; (c) on valid coupon, wrap order creation + `coupon.usage_count` increment in a Prisma `$transaction`; (d) store `coupon_code` and `discount_amount` on the new order record; (e) return 400 with coupon error if re-validation fails
- [x] T008 [US1] Modify order cancellation in `backend/src/routes/orders.ts` — when `PATCH /api/orders/:id` sets `status: "cancelled"`, check if order has `coupon_code`; if so, decrement that coupon's `usage_count` by 1 (floor at 0) using `prisma.coupon.update({ where: { code }, data: { usage_count: { decrement: 1 } } })` inside the same update transaction
- [x] T009 [P] [US1] Add `couponsApi` to `frontend/lib/api.ts` with a `validate(code: string, subtotal: number)` method that calls `POST /api/coupons/validate` using plain `fetch()` (not axios, to avoid auth interceptors) — returns the validated response or throws with the error message
- [x] T010 [P] [US1] Modify `frontend/components/checkout/CartReview.tsx` to add: (a) coupon input field + Apply button below the items list; (b) loading/error state for the apply action; (c) discount line item in the order summary (`Coupon [CODE]: −€X.XX`) when a coupon is applied; (d) a Remove link to clear the coupon; (e) call `couponsApi.validate()` on apply and propagate result up via `onCouponApplied(code, discountAmount)` callback prop
- [x] T011 [US1] Modify `frontend/app/checkout/page.tsx` to: (a) add `couponCode` and `discountAmount` state (`useState<string | null>(null)` and `useState(0)`); (b) add `handleCouponApplied(code, amount)` handler and pass as prop to `CartReview`; (c) pass `couponCode` and `discountAmount` to `ordersApi.create()` call for both authenticated and guest flows; (d) ensure `totalPrice - discountAmount` is shown as the final total displayed to the customer

**Checkpoint**: Customer can apply a coupon at checkout, see the discount, and place an order with the coupon recorded. Validate via quickstart.md Step 3 and 4.

---

## Phase 4: User Story 2 — Admin Creates a Coupon (Priority: P2)

**Goal**: Admin can create new coupons via the admin panel coupons form with all required and optional fields.

**Independent Test**: Log in to admin panel → navigate to Coupons → create a coupon with code `TEST10`, type `percentage`, value `10` → verify it appears in the coupons list → apply it at `/checkout` to confirm it works.

### Implementation for User Story 2

- [x] T012 [US2] Implement `POST /api/admin/coupons` in `backend/src/routes/coupons.ts` — validate required fields (`code`, `discountType`, `discountValue`) with zod schema; normalise code to uppercase; check for duplicate code (return 409 if exists); validate discount_value ≤ 100 for percentage type; create record in DB; return 201 with full coupon object
- [x] T013 [US2] Rewrite `admin/app/coupons/page.tsx` to include a Create Coupon form (shadcn/ui Card + form fields): code input (text, required), discount type select (`percentage` | `fixed`), discount value input (number, required), optional min order value (number), optional max usage count (number), optional expiry date (date picker); submit calls `POST /api/admin/coupons`; show success toast and clear form on success; show error toast on failure (duplicate code, validation errors)

**Checkpoint**: Admin can create coupons from the admin panel. The created coupon is immediately usable at checkout.

---

## Phase 5: User Story 3 — Admin Manages Existing Coupons (Priority: P3)

**Goal**: Admin can view all coupons in a list/table with computed status, toggle active/inactive, and delete coupons.

**Independent Test**: Create 3 coupons → view the list → deactivate one → verify customer gets "no longer available" error → delete one → verify it's gone from list and returns COUPON_INVALID at checkout.

### Implementation for User Story 3

- [x] T014 [US3] Implement `GET /api/admin/coupons` in `backend/src/routes/coupons.ts` — return all coupons ordered by `created_at DESC`; compute `status` field at query time: `"Expired"` if `expires_at IS NOT NULL AND expires_at < NOW()`, `"Inactive"` if `is_active = false`, `"Active"` otherwise; return array under `data` key
- [x] T015 [US3] Implement `PATCH /api/admin/coupons/:id/toggle` in `backend/src/routes/coupons.ts` — find coupon by id (404 if not found); flip `is_active` boolean; return updated coupon with recomputed `status` field
- [x] T016 [US3] Implement `DELETE /api/admin/coupons/:id` in `backend/src/routes/coupons.ts` — find coupon by id (404 if not found); `prisma.coupon.delete()`; return `{ message: "Coupon deleted." }`
- [x] T017 [US3] Update `admin/app/coupons/page.tsx` to add: (a) data fetching on mount from `GET /api/admin/coupons`; (b) coupons list table (shadcn/ui Table) with columns: Code, Type, Value, Min Order, Expiry, Usage (count/limit), Status badge (Active=green, Inactive=gray, Expired=red); (c) Toggle button per row that calls `PATCH /:id/toggle` and refreshes list; (d) Delete button per row with confirmation dialog (shadcn/ui AlertDialog) that calls `DELETE /:id` and refreshes list; (e) place Create Coupon form (from T013) above or beside the table

**Checkpoint**: Admin has full CRUD visibility and control over all coupons with real-time status display.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Integration verification and UI consistency.

- [x] T018 [P] Verify `admin/app/orders/page.tsx` (or order detail view) displays `coupon_code` and `discount_amount` for orders that used a coupon — add these fields to the order display if not already shown
- [x] T019 Run end-to-end integration test per `specs/007-coupon-management/quickstart.md` — verify all 5 steps pass: migration, seed coupon, validate endpoint, checkout flow, admin management

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
  - T001 → T002 → T003 (sequential, same schema file)
  - T004, T005 can run in parallel after T003
- **Phase 3 (US1)**: Depends on Phase 1 complete
  - T006: depends on T003 (Coupon table exists)
  - T007, T008: depend on T003 (Order columns exist)
  - T009, T010: can run in parallel (different files: api.ts vs CartReview.tsx)
  - T011: depends on T009 (needs couponsApi), T010 (needs callback prop)
- **Phase 4 (US2)**: Depends on Phase 1 complete (T012 needs Coupon table)
  - T013 depends on T012 (needs the endpoint to call)
- **Phase 5 (US3)**: Depends on Phase 4 complete (T014-T016 extend same coupons.ts)
  - T014, T015, T016 are sequential (same file, add one route at a time)
  - T017 depends on T014, T015, T016
- **Phase 6 (Polish)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1)**: Can start immediately after Phase 1 — no dependency on US2 or US3
- **US2 (P2)**: Can start immediately after Phase 1 — independent of US1
- **US3 (P3)**: Depends on US2 complete (extends the same coupons.ts and admin page)

### Parallel Opportunities

- T004 and T005 (after T003)
- T006, T007/T008 (after T003 — different concerns, US1 backend)
- T009 and T010 (after T006 — different files, US1 frontend)
- T012 and US1 frontend tasks (after T003 — different files, US2 backend vs US1 frontend)

---

## Parallel Example: User Story 1 Backend

```text
After T003 (migration):
  → T006: Implement validate endpoint in coupons.ts
  → T007 + T008: Modify orders.ts for coupon on create/cancel

After T006:
  → T009: Add couponsApi to frontend/lib/api.ts
  → T010: Modify CartReview.tsx with coupon input

After T009 + T010:
  → T011: Lift state in checkout/page.tsx
```

---

## Implementation Strategy

### MVP (User Story 1 Only)

1. Complete Phase 1 (T001–T005) — DB + route skeleton
2. Complete Phase 3 (T006–T011) — full customer coupon flow
3. **Seed a test coupon directly in DB or via a one-off script**
4. Validate: apply coupon at checkout → order placed → check order record
5. US1 is fully functional without admin UI

### Incremental Delivery

1. Phase 1 → Foundation ready
2. Phase 3 (US1) → Customers can apply coupons → **Demo-able MVP**
3. Phase 4 (US2) → Admin can create coupons via UI
4. Phase 5 (US3) → Admin can manage (list/toggle/delete) coupons
5. Phase 6 → Polish + end-to-end validation

---

## Notes

- [P] = different files, can run in parallel
- [US1/US2/US3] maps each task to its user story for traceability
- No automated tests in scope (not requested)
- Coupon codes are always normalised to uppercase — handle in both backend validate endpoint AND admin create endpoint
- The `$transaction` in T007 is critical for usage count correctness under concurrent orders
- All new Order columns default to NULL — zero impact on existing orders or checkout flow
- Commit after each Phase checkpoint for easy rollback if needed
