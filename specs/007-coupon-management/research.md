# Research: Coupon Management System

**Feature**: 007-coupon-management
**Date**: 2026-03-14

## Decision 1: Coupon Validation Strategy

**Decision**: Dual validation — optimistic client-side at apply-time, authoritative server-side at order-submission.

**Rationale**: Immediate feedback via a dedicated `POST /api/coupons/validate` endpoint keeps UX snappy (<1s per SC-001). Re-validation at order submission prevents race conditions (coupon expiring between apply and submit). No external service needed — all rules are internal DB checks.

**Alternatives considered**:
- Client-only validation: Rejected — can be bypassed; usage count can diverge.
- Server-only on submit: Rejected — poor UX; customer only discovers invalid coupon at final step.

## Decision 2: Coupon Storage — Dedicated Table vs. Order-embedded JSON

**Decision**: Dedicated `coupons` table in PostgreSQL with Prisma model; Order model extended with two nullable columns (`coupon_code`, `discount_amount`).

**Rationale**: Dedicated table supports admin CRUD, usage counting, status management. Denormalising `coupon_code` + `discount_amount` onto Order preserves order history even if the coupon is later deleted. Matches existing pattern (orders already store `items` as JSON snapshot for the same reason).

**Alternatives considered**:
- Embed coupon in Order's `items` JSON: Rejected — makes querying and admin display of "orders that used coupon X" difficult.
- Foreign key from Order to Coupon: Rejected — prevents deletion of coupons (referential integrity blocks it) and loses history if coupon deleted.

## Decision 3: Usage Count Concurrency

**Decision**: Use Prisma `$transaction` with `increment` for usage count updates to avoid race conditions under concurrent orders.

**Rationale**: Two customers simultaneously placing orders with the same limited coupon could both read `usage_count = 9 / max = 10`, both pass validation, and both increment — resulting in `usage_count = 11`. Wrapping the validate-and-increment in a transaction with a final count check prevents this.

**Alternatives considered**:
- Application-level locking: Rejected — stateless Express instances can't share locks.
- Optimistic concurrency (version field): Viable but more complex for this scale; transaction is simpler.

## Decision 4: Coupon Code Case-Insensitivity

**Decision**: Normalise to uppercase on both write (admin creation) and read (customer apply). Store as uppercase in DB.

**Rationale**: Simpler than case-insensitive DB collation changes. Consistent with assumption documented in spec. Admin always sees canonical UPPERCASE codes.

**Alternatives considered**:
- Store as-is, query with `mode: 'insensitive'` (Prisma): Viable, but normalisation is more explicit and portable.

## Decision 5: Where Coupon Input Lives in Checkout

**Decision**: Coupon input added to **CartReview component** (Step 1 of checkout), displayed in the order summary sidebar alongside subtotal, discount line, and total.

**Rationale**: CartReview already renders the order summary. Customers naturally apply discounts before entering shipping/payment details. State (`couponCode`, `discountAmount`) flows up to the parent `CheckoutPage` and is passed to `ordersApi.create()`.

**Alternatives considered**:
- Payment step (Step 3): Rejected — customers expect to see final price before entering payment details.
- Separate `/cart` page: Rejected — spec says "at checkout", and cart is Zustand-only (no server involvement).

## Technology Summary

| Concern | Choice | Notes |
|---|---|---|
| DB model | Prisma `Coupon` model | New table `coupons` |
| Order extension | Two new nullable columns | `coupon_code String?`, `discount_amount Decimal?` |
| Validation endpoint | `POST /api/coupons/validate` | Public (no auth required) |
| Admin CRUD | `GET/POST/PATCH/DELETE /api/admin/coupons` | Admin-auth protected |
| Concurrency | Prisma `$transaction` | Increment inside transaction |
| Code normalisation | Uppercase on write + read | Store uppercase in DB |
| Coupon UI placement | CartReview (checkout step 1) | State lifted to CheckoutPage |
