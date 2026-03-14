# API Contracts: Coupon Management System

**Feature**: 007-coupon-management
**Date**: 2026-03-14
**Base URL**: `/api`

---

## Public Endpoints

### POST /api/coupons/validate
Validate a coupon code against a given cart subtotal. Used by checkout frontend at apply-time.

**Auth**: None required (public)

**Request Body**:
```json
{
  "code": "SUMMER10",
  "subtotal": 75.00
}
```

**Response 200 — Valid**:
```json
{
  "valid": true,
  "code": "SUMMER10",
  "discountType": "percentage",
  "discountValue": 10,
  "discountAmount": 7.50,
  "finalTotal": 67.50
}
```

**Response 400 — Invalid** (with reason):
```json
{
  "valid": false,
  "error": "COUPON_EXPIRED" | "COUPON_INVALID" | "COUPON_INACTIVE" | "COUPON_USAGE_LIMIT_REACHED" | "COUPON_MIN_ORDER_NOT_MET",
  "message": "Human-readable message",
  "minOrderValue": 50.00   // only present for MIN_ORDER_NOT_MET
}
```

**Validation logic**:
1. Normalise `code` to uppercase
2. Look up coupon by code → 404-style error as `COUPON_INVALID` if not found
3. Check `is_active = true` → `COUPON_INACTIVE`
4. Check `expires_at IS NULL OR expires_at > NOW()` → `COUPON_EXPIRED`
5. Check `max_usage_count IS NULL OR usage_count < max_usage_count` → `COUPON_USAGE_LIMIT_REACHED`
6. Check `min_order_value IS NULL OR subtotal >= min_order_value` → `COUPON_MIN_ORDER_NOT_MET`
7. Calculate `discountAmount`: if percentage → `subtotal * (value/100)`; if fixed → `min(value, subtotal)`

---

## Admin Endpoints (require admin JWT)

### GET /api/admin/coupons
List all coupons with computed status.

**Auth**: Admin JWT required

**Query params**: None (all coupons returned — small dataset)

**Response 200**:
```json
{
  "data": [
    {
      "id": "clxxx",
      "code": "SUMMER10",
      "discountType": "percentage",
      "discountValue": "10.00",
      "minOrderValue": "50.00",
      "maxUsageCount": 100,
      "usageCount": 42,
      "isActive": true,
      "expiresAt": "2026-12-31T23:59:59Z",
      "createdAt": "2026-03-14T10:00:00Z",
      "status": "Active"   // computed: "Active" | "Inactive" | "Expired"
    }
  ]
}
```

---

### POST /api/admin/coupons
Create a new coupon.

**Auth**: Admin JWT required

**Request Body**:
```json
{
  "code": "SUMMER10",
  "discountType": "percentage",
  "discountValue": 10,
  "minOrderValue": 50,
  "maxUsageCount": 100,
  "expiresAt": "2026-12-31T23:59:59Z"
}
```

**Required fields**: `code`, `discountType`, `discountValue`
**Optional fields**: `minOrderValue`, `maxUsageCount`, `expiresAt`

**Response 201**:
```json
{ "data": { /* full coupon object */ } }
```

**Error 409** — duplicate code:
```json
{ "error": "A coupon with this code already exists." }
```

**Error 400** — validation failure:
```json
{ "error": "Discount value cannot exceed 100 for percentage coupons." }
```

---

### PATCH /api/admin/coupons/:id/toggle
Toggle `is_active` status (activate or deactivate).

**Auth**: Admin JWT required

**Response 200**:
```json
{ "data": { "id": "clxxx", "isActive": false, "status": "Inactive" } }
```

---

### DELETE /api/admin/coupons/:id
Permanently delete a coupon.

**Auth**: Admin JWT required

**Response 200**:
```json
{ "message": "Coupon deleted." }
```

**Error 404**:
```json
{ "error": "Coupon not found." }
```

---

## Modified Endpoint: POST /api/orders (existing)
Extended to accept optional coupon fields.

**Additional Request Body fields** (optional):
```json
{
  "couponCode": "SUMMER10",
  "discountAmount": 7.50
}
```

**Behaviour change**:
1. If `couponCode` provided: re-validate server-side (same rules as `/validate`)
2. On validation failure: return `400` with coupon error — order is NOT created
3. On success: `total_amount = subtotal - discountAmount`, store `coupon_code` + `discount_amount` on order, increment `usage_count` inside transaction
4. On order cancellation (PATCH `/api/orders/:id` with `status: "cancelled"`): if order has `coupon_code`, decrement that coupon's `usage_count` (min floor: 0)

---

## Error Taxonomy

| Code | HTTP Status | Meaning |
|---|---|---|
| `COUPON_INVALID` | 400 | Code not found in DB |
| `COUPON_INACTIVE` | 400 | `is_active = false` |
| `COUPON_EXPIRED` | 400 | `expires_at < NOW()` |
| `COUPON_USAGE_LIMIT_REACHED` | 400 | `usage_count >= max_usage_count` |
| `COUPON_MIN_ORDER_NOT_MET` | 400 | `subtotal < min_order_value` |
| `COUPON_DUPLICATE_CODE` | 409 | Code already exists (admin create) |
