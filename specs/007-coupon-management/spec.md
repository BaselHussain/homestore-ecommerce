# Feature Specification: Coupon Management System

**Feature Branch**: `007-coupon-management`
**Created**: 2026-03-14
**Status**: Draft
**Input**: User description: "Coupons system — admin can create/manage discount coupons (percentage or fixed amount, min order value, expiry date, usage limits). Customers can apply coupon codes at checkout. Coupon validation on frontend and backend. Show discount line in order summary."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Customer Applies Coupon at Checkout (Priority: P1)

A customer at the checkout page enters a coupon code in a dedicated input field and clicks "Apply". The system validates the code in real-time and immediately shows the discount deducted from the order total with a clear breakdown line (e.g., "Coupon SUMMER10: −€5.00"). If the code is invalid, expired, or the cart doesn't meet the minimum order value, a descriptive error message is shown.

**Why this priority**: This is the core customer-facing value. Without this, the entire feature has no user impact.

**Independent Test**: Can be fully tested end-to-end by entering a valid coupon code on the checkout page and verifying the discount is applied and reflected in the order total.

**Acceptance Scenarios**:

1. **Given** a valid, active coupon code exists and cart total meets the minimum order value, **When** the customer enters the code and clicks Apply, **Then** the discount is calculated and shown as a line item in the order summary, and the final total is reduced accordingly.
2. **Given** an expired coupon code, **When** the customer enters the code and clicks Apply, **Then** an error message "This coupon has expired" is shown and no discount is applied.
3. **Given** a valid coupon but the cart total is below the minimum order value, **When** the customer applies the code, **Then** an error message states the minimum order requirement (e.g., "Minimum order of €50 required for this coupon").
4. **Given** a coupon that has reached its maximum usage limit, **When** the customer applies the code, **Then** an error message "This coupon is no longer available" is shown.
5. **Given** a valid coupon has been applied, **When** the customer removes it or changes their cart, **Then** the coupon can be removed and the order total reverts to the original amount.

---

### User Story 2 - Admin Creates a Coupon (Priority: P2)

An admin logs in to the admin panel, navigates to Coupons, and creates a new coupon by filling out a form: coupon code (auto-generate or manual), discount type (percentage or fixed amount), discount value, optional minimum order value, optional expiry date, and optional maximum usage limit. The coupon is saved and immediately available for customers.

**Why this priority**: Without coupon creation, there are no coupons to apply. P2 only because P1 (apply) can be tested with seeded data.

**Independent Test**: Can be tested by creating a coupon in admin, then verifying the coupon appears in the coupons list and is accepted at checkout.

**Acceptance Scenarios**:

1. **Given** an admin is on the Create Coupon page, **When** they fill all required fields and submit, **Then** the coupon is saved and appears in the coupon list with correct details.
2. **Given** an admin enters a coupon code that already exists, **When** they submit the form, **Then** an error is shown: "A coupon with this code already exists."
3. **Given** an admin sets a percentage discount, **When** they enter a value greater than 100%, **Then** the form rejects the input with a validation error.
4. **Given** an admin creates a coupon with no expiry date, **When** a customer applies the code, **Then** the coupon is treated as never-expiring.

---

### User Story 3 - Admin Manages Existing Coupons (Priority: P3)

An admin can view all coupons in a list/table showing: code, type, value, min order, expiry, usage count vs. limit, and status (active/expired/disabled). The admin can deactivate a coupon without deleting it, or delete it entirely.

**Why this priority**: Management operations are enhancement over core creation and application flows.

**Independent Test**: Can be tested by creating several coupons, toggling active/inactive status, and verifying inactive coupons are rejected at checkout.

**Acceptance Scenarios**:

1. **Given** several coupons exist, **When** admin views the Coupons list, **Then** all coupons are shown with code, type, discount value, usage count, expiry date, and status.
2. **Given** an active coupon, **When** admin deactivates it, **Then** the coupon status shows "Inactive" and customers can no longer apply it at checkout.
3. **Given** a coupon exists, **When** admin deletes it, **Then** it no longer appears in the list and cannot be applied at checkout.

---

### Edge Cases

- What happens when a coupon is applied and then the product is removed from cart, dropping below the minimum order value? → Discount is removed and customer is notified.
- What happens when a fixed-amount coupon discount exceeds the order total? → Final total is capped at €0; the discount shown equals the original total.
- What happens when two coupons are entered consecutively? → Only one coupon may be active per order; applying a new code replaces the existing one.
- What happens when a coupon expires between the time a customer applies it and the time they complete checkout? → Coupon is validated again at order submission; expired coupon results in an error before payment.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow admin users to create coupons with the following fields: unique code, discount type (percentage or fixed), discount value, optional minimum order value, optional expiry date, optional maximum total usage count.
- **FR-002**: System MUST validate that coupon codes are unique at creation time.
- **FR-003**: System MUST allow admin users to view all coupons in a list with status, usage stats, and all configuration details visible.
- **FR-004**: System MUST allow admin users to deactivate (disable without deleting) a coupon.
- **FR-005**: System MUST allow admin users to delete a coupon permanently.
- **FR-005b**: System MUST NOT allow editing of an existing coupon's fields after creation. Admins who need to change a coupon must deactivate the existing one and create a new coupon.
- **FR-006**: System MUST expose a coupon validation endpoint that checks: code existence, active status, expiry date, minimum order value, and usage limit.
- **FR-007**: Checkout page MUST include a coupon code input field with an Apply button.
- **FR-008**: System MUST display the applied discount as a separate line item in the checkout order summary (e.g., "Coupon [CODE]: −€X.XX").
- **FR-009**: System MUST re-validate the coupon server-side at order submission time (not just at apply time).
- **FR-010**: System MUST increment the usage count of a coupon each time an order using that coupon is successfully placed. System MUST decrement the usage count when an order that used a coupon is cancelled or refunded, making the slot available again.
- **FR-011**: System MUST allow only one coupon per order.
- **FR-012**: System MUST store the coupon code and discount amount applied on the resulting order record.
- **FR-013**: System MUST provide descriptive error messages for all coupon rejection reasons (expired, invalid, minimum not met, usage limit reached, inactive).

### Key Entities

- **Coupon**: Represents a discount rule. Attributes: unique code (string), discount type (percentage | fixed), discount value (decimal), minimum order value (decimal, optional), expiry date (datetime, optional), max usage count (integer, optional), current usage count (integer), is_active (boolean), created_at. Display status is computed: "Expired" when current date > expiry date, "Inactive" when is_active = false, "Active" otherwise. Coupons are immutable after creation — no field editing permitted.
- **Order** (existing, extended): Gains two new attributes: applied coupon code (string, nullable) and discount amount (decimal, nullable).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A customer can apply a valid coupon code and see the discount reflected in the order summary within 1 second of clicking Apply.
- **SC-002**: 100% of coupon validation rules (expiry, minimum order, usage limit, active status) are enforced at both apply-time and order-submission-time.
- **SC-003**: Admin can create, view, deactivate, and delete coupons without leaving the admin panel.
- **SC-004**: Applied coupon code and discount amount are persisted on the order record and visible in the admin Orders view.
- **SC-005**: A fixed-amount coupon that exceeds the order total never results in a negative order total.

## Clarifications

### Session 2026-03-14

- Q: Can admin edit an existing coupon after creation? → A: No editing allowed — admin must deactivate and create a new coupon to change values.
- Q: Should coupon usage count be decremented when an order is cancelled or refunded? → A: Yes — decrement usage count on cancellation/refund so the slot becomes available again.
- Q: Is "Expired" status computed or explicit? → A: Computed — derived automatically when current date exceeds expiry date; admin only controls active/inactive toggle.

## Assumptions

- One coupon per order (no coupon stacking).
- Coupon codes are case-insensitive (SUMMER10 = summer10).
- Currency is EUR throughout (matching existing store configuration).
- Usage limit tracks total uses across all customers, not per-customer uses.
- Coupons apply to the subtotal (before shipping, if shipping is added later).
- Auto-generate coupon code is a "nice to have" — admin can always type manually.
