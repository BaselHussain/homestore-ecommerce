import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { Coupon } from '@prisma/client';
import prisma from '../lib/prisma';
import { adminOnly } from '../middlewares/adminOnly';

// Coupon validate: 20 attempts per 15 minutes per IP (prevent brute-force)
const validateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { valid: false, error: 'TOO_MANY_ATTEMPTS', message: 'Too many attempts. Please try again shortly.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes (mounted at /api/coupons)
const publicRouter = Router();

// Admin routes (mounted at /api/admin/coupons)
const adminRouter = Router();

// Helper: compute display status for a coupon
function computeStatus(coupon: { is_active: boolean; expires_at: Date | null }): 'Active' | 'Inactive' | 'Expired' {
  if (coupon.expires_at && coupon.expires_at < new Date()) return 'Expired';
  if (!coupon.is_active) return 'Inactive';
  return 'Active';
}

// Helper: validate coupon against a subtotal — returns error or valid coupon with discount
async function validateCoupon(
  code: string,
  subtotal: number
): Promise<{ error: string; message: string; minOrderValue?: number } | { coupon: Coupon; discountAmount: number }> {
  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });

  if (!coupon) return { error: 'COUPON_INVALID', message: 'This coupon code is not valid.' };
  if (!coupon.is_active) return { error: 'COUPON_INACTIVE', message: 'This coupon is no longer active.' };
  if (coupon.expires_at && coupon.expires_at < new Date()) return { error: 'COUPON_EXPIRED', message: 'This coupon has expired.' };
  if (coupon.max_usage_count !== null && coupon.usage_count >= coupon.max_usage_count) {
    return { error: 'COUPON_USAGE_LIMIT_REACHED', message: 'This coupon is no longer available.' };
  }
  if (coupon.min_order_value !== null && subtotal < Number(coupon.min_order_value)) {
    return {
      error: 'COUPON_MIN_ORDER_NOT_MET',
      message: `A minimum order of €${Number(coupon.min_order_value).toFixed(2)} is required for this coupon.`,
      minOrderValue: Number(coupon.min_order_value),
    };
  }

  const discountAmount =
    coupon.discount_type === 'percentage'
      ? Math.min(subtotal * (Number(coupon.discount_value) / 100), subtotal)
      : Math.min(Number(coupon.discount_value), subtotal);

  return { coupon, discountAmount };
}

// POST /api/coupons/validate  (public — no auth required)
publicRouter.post('/validate', validateLimiter, async (req: Request, res: Response) => {
  const { code, subtotal } = req.body;

  if (!code || typeof code !== 'string') {
    res.status(400).json({ valid: false, error: 'COUPON_INVALID', message: 'Please enter a coupon code.' });
    return;
  }
  if (typeof subtotal !== 'number' || subtotal <= 0) {
    res.status(400).json({ valid: false, error: 'INVALID_SUBTOTAL', message: 'Invalid cart subtotal.' });
    return;
  }

  const result = await validateCoupon(code, subtotal);

  if ('error' in result) {
    res.status(400).json({ valid: false, ...result });
    return;
  }

  const { coupon, discountAmount } = result;
  res.json({
    valid: true,
    code: coupon.code,
    discountType: coupon.discount_type,
    discountValue: Number(coupon.discount_value),
    discountAmount: parseFloat(discountAmount.toFixed(2)),
    finalTotal: parseFloat((subtotal - discountAmount).toFixed(2)),
  });
});

// GET /api/admin/coupons  (admin only)
adminRouter.get('/', adminOnly, async (_req: Request, res: Response) => {
  const coupons = await prisma.coupon.findMany({ orderBy: { created_at: 'desc' } });
  const data = coupons.map((c) => ({ ...c, status: computeStatus(c) }));
  res.json({ data });
});

const createCouponSchema = z.object({
  code: z.string().min(3).max(50).regex(/^[A-Z0-9_-]+$/, 'Code must be uppercase letters, numbers, hyphens, or underscores only'),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number().positive(),
  minOrderValue: z.number().positive().optional(),
  maxUsageCount: z.number().int().positive().optional(),
  expiresAt: z.string().datetime().optional(),
}).refine(
  (data) => !(data.discountType === 'percentage' && data.discountValue > 100),
  { message: 'Discount value cannot exceed 100 for percentage coupons.', path: ['discountValue'] }
);

// POST /api/admin/coupons  (admin only)
adminRouter.post('/', adminOnly, async (req: Request, res: Response) => {
  let body: z.infer<typeof createCouponSchema>;
  try {
    // Normalise code to uppercase before validation
    body = createCouponSchema.parse({ ...req.body, code: String(req.body.code ?? '').toUpperCase() });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors.map((e) => e.message).join(', ') });
      return;
    }
    throw err;
  }

  const existing = await prisma.coupon.findUnique({ where: { code: body.code } });
  if (existing) {
    res.status(409).json({ error: 'A coupon with this code already exists.' });
    return;
  }

  const coupon = await prisma.coupon.create({
    data: {
      code: body.code,
      discount_type: body.discountType,
      discount_value: body.discountValue,
      min_order_value: body.minOrderValue ?? null,
      max_usage_count: body.maxUsageCount ?? null,
      expires_at: body.expiresAt ? new Date(body.expiresAt) : null,
    },
  });

  res.status(201).json({ data: { ...coupon, status: computeStatus(coupon) } });
});

// PATCH /api/admin/coupons/:id/toggle  (admin only)
adminRouter.patch('/:id/toggle', adminOnly, async (req: Request, res: Response) => {
  const { id } = req.params;
  const existing = await prisma.coupon.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: 'Coupon not found.' });
    return;
  }
  const coupon = await prisma.coupon.update({
    where: { id },
    data: { is_active: !existing.is_active },
  });
  res.json({ data: { ...coupon, status: computeStatus(coupon) } });
});

// DELETE /api/admin/coupons/:id  (admin only)
adminRouter.delete('/:id', adminOnly, async (req: Request, res: Response) => {
  const { id } = req.params;
  const existing = await prisma.coupon.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: 'Coupon not found.' });
    return;
  }
  await prisma.coupon.delete({ where: { id } });
  res.json({ message: 'Coupon deleted.' });
});

export { validateCoupon };
export { publicRouter as couponsPublicRouter, adminRouter as couponsAdminRouter };
