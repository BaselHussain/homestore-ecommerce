# Quickstart: Coupon Management System

**Feature**: 007-coupon-management
**Date**: 2026-03-14

## Prerequisites

- Backend running (`npm run dev` in `/backend`)
- Frontend running (`npm run dev` in `/frontend`)
- Admin running (`npm run dev` in `/admin`)
- Neon DB connection active (`.env` with `DATABASE_URL`)

## Step 1: Run DB Migration

```bash
cd backend
npx prisma migrate dev --name add-coupon-management
```

This creates the `coupons` table and adds `coupon_code` + `discount_amount` columns to `orders`.

## Step 2: Seed a Test Coupon (optional)

```bash
# Use admin panel OR run directly:
curl -X POST http://localhost:5000/api/admin/coupons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{"code":"TEST10","discountType":"percentage","discountValue":10}'
```

## Step 3: Test Validation Endpoint

```bash
curl -X POST http://localhost:5000/api/coupons/validate \
  -H "Content-Type: application/json" \
  -d '{"code":"test10","subtotal":100}'
# Expected: {"valid":true,"code":"TEST10","discountAmount":10.00,"finalTotal":90.00}
```

## Step 4: Test in Checkout UI

1. Add any product to cart
2. Go to `/checkout`
3. In CartReview (Step 1), enter `TEST10` in the coupon field and click Apply
4. Confirm discount line appears: "Coupon TEST10: −€10.00"
5. Complete order — verify admin Orders view shows `coupon_code: TEST10`

## Step 5: Test Admin Coupon Management

1. Log in to admin panel
2. Navigate to Coupons
3. Create a coupon (percentage + fixed), verify it appears in list
4. Deactivate a coupon — verify customers get "no longer available" error
5. Delete a coupon — verify it's removed from list

## File Locations

| What | Path |
|---|---|
| Prisma schema changes | `backend/prisma/schema.prisma` |
| Coupon routes (admin) | `backend/src/routes/coupons.ts` |
| Coupon routes (public validate) | `backend/src/routes/coupons.ts` |
| Order route (modified) | `backend/src/routes/orders.ts` |
| Admin coupon page | `admin/app/coupons/page.tsx` |
| Checkout coupon input | `frontend/components/checkout/CartReview.tsx` |
| Checkout page (state) | `frontend/app/checkout/page.tsx` |
| API helper | `frontend/lib/api.ts` (add `couponsApi`) |
