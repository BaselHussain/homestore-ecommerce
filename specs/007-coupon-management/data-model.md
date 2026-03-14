# Data Model: Coupon Management System

**Feature**: 007-coupon-management
**Date**: 2026-03-14

## New Entity: Coupon

**Table**: `coupons`

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | String (cuid) | PK | Auto-generated |
| `code` | String | UNIQUE, NOT NULL | Stored uppercase; max 50 chars |
| `discount_type` | String | NOT NULL | `'percentage'` or `'fixed'` |
| `discount_value` | Decimal(10,2) | NOT NULL | Percentage: 0.01–100.00; Fixed: > 0 |
| `min_order_value` | Decimal(10,2) | NULL | Optional minimum cart subtotal |
| `max_usage_count` | Int | NULL | NULL = unlimited |
| `usage_count` | Int | NOT NULL, DEFAULT 0 | Total successful uses |
| `is_active` | Boolean | NOT NULL, DEFAULT true | Admin toggle |
| `expires_at` | DateTime | NULL | NULL = never expires |
| `created_at` | DateTime | NOT NULL, DEFAULT now() | Immutable after creation |

**Computed Display Status** (derived at query time, not stored):
- `"Expired"` — `expires_at IS NOT NULL AND expires_at < NOW()`
- `"Inactive"` — `is_active = false`
- `"Active"` — all other cases

**Validation Rules**:
- `code` must match `/^[A-Z0-9_-]{3,50}$/` after uppercase normalisation
- `discount_value` must be `> 0`; if `discount_type = 'percentage'` then `<= 100`
- `min_order_value` if present must be `> 0`
- `max_usage_count` if present must be `>= 1`
- `expires_at` if present must be in the future at creation time

---

## Modified Entity: Order (existing table `orders`)

**Two new nullable columns added**:

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `coupon_code` | String | NULL | Snapshot of applied coupon code at order time |
| `discount_amount` | Decimal(10,2) | NULL | Actual discount deducted from subtotal |

**Why nullable**: Guest orders and orders without coupons store `NULL`. Denormalised snapshot preserves order history if coupon is later deleted.

**Updated total_amount semantics**: `total_amount = subtotal - discount_amount` (discount_amount is always positive or NULL).

---

## State Transitions: Coupon

```
Created (is_active=true)
    │
    ├──[admin deactivates]──► Inactive (is_active=false)
    │                              │
    │                              └──[cannot be applied]
    │
    ├──[expires_at passes]──► Expired (computed, is_active=true)
    │                              │
    │                              └──[cannot be applied]
    │
    └──[admin deletes]──► Deleted (removed from DB)
```

---

## Prisma Schema Changes

```prisma
model Coupon {
  id               String    @id @default(cuid())
  code             String    @unique
  discount_type    String    @map("discountType")
  discount_value   Decimal   @db.Decimal(10, 2) @map("discountValue")
  min_order_value  Decimal?  @db.Decimal(10, 2) @map("minOrderValue")
  max_usage_count  Int?      @map("maxUsageCount")
  usage_count      Int       @default(0) @map("usageCount")
  is_active        Boolean   @default(true) @map("isActive")
  expires_at       DateTime? @map("expiresAt")
  created_at       DateTime  @default(now()) @map("createdAt")

  @@map("coupons")
}

// Order model additions (two new fields):
// coupon_code      String?  @map("couponCode")
// discount_amount  Decimal? @db.Decimal(10, 2) @map("discountAmount")
```

---

## Migration Summary

1. `CREATE TABLE coupons` — new table
2. `ALTER TABLE orders ADD COLUMN coupon_code VARCHAR NULL`
3. `ALTER TABLE orders ADD COLUMN discount_amount DECIMAL(10,2) NULL`

All existing orders are unaffected (columns default to NULL).
