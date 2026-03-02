import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middlewares/auth';
import { hashPassword, verifyPassword, validatePasswordStrength } from '../lib/security';
import prisma from '../lib/prisma';
import { z } from 'zod';

const router = Router();
router.use(authenticate); // All user routes require auth

// GET /api/users/profile
router.get('/profile', async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    include: { addresses: true },
  });

  if (!user) {
    res.status(404).json({ success: false, error: 'User not found' });
    return;
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      addresses: user.addresses.map((a) => ({
        id: a.id,
        label: a.label,
        street: a.street,
        city: a.city,
        state: a.state,
        zipCode: a.zip_code,
        country: a.country,
        isDefault: a.is_default,
      })),
    },
  });
});

// PUT /api/users/profile
router.put('/profile', async (req: AuthRequest, res: Response) => {
  const UpdateProfileSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    email: z.string().email().optional(),
  });

  const parsed = UpdateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.errors[0]?.message });
    return;
  }

  const { name, email } = parsed.data;
  const updateData: { name?: string; email?: string } = {};
  if (name) updateData.name = name;
  if (email) updateData.email = email.toLowerCase().trim();

  const updated = await prisma.user.update({ where: { id: req.userId }, data: updateData });

  res.json({
    success: true,
    user: { id: updated.id, email: updated.email, name: updated.name },
  });
});

// PUT /api/users/password
router.put('/password', async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400).json({ success: false, error: 'Current and new password are required' });
    return;
  }

  const { valid, message } = validatePasswordStrength(newPassword);
  if (!valid) {
    res.status(400).json({ success: false, error: message });
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) {
    res.status(404).json({ success: false, error: 'User not found' });
    return;
  }

  const passwordValid = await verifyPassword(currentPassword, user.password_hash);
  if (!passwordValid) {
    res.status(401).json({ success: false, error: 'Current password is incorrect' });
    return;
  }

  const password_hash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: req.userId }, data: { password_hash } });

  res.json({ success: true, message: 'Password updated successfully' });
});

// GET /api/users/orders
router.get('/orders', async (req: AuthRequest, res: Response) => {
  const orders = await prisma.order.findMany({
    where: { user_id: req.userId },
    orderBy: { created_at: 'desc' },
  });

  res.json({
    success: true,
    orders: orders.map((o) => ({
      id: o.id,
      status: o.status,
      total: Number(o.total_amount),
      currency: 'USD',
      createdAt: o.created_at.toISOString(),
      trackingNumber: o.tracking_number || null,
      items: o.items,
      shippingAddress: o.shipping_address,
    })),
  });
});

// GET /api/users/orders/:id
router.get('/orders/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const order = await prisma.order.findFirst({
    where: { id, user_id: req.userId },
  });

  if (!order) {
    res.status(404).json({ success: false, error: 'Order not found' });
    return;
  }

  res.json({
    success: true,
    order: {
      id: order.id,
      status: order.status,
      total: Number(order.total_amount),
      currency: 'USD',
      createdAt: order.created_at.toISOString(),
      updatedAt: order.updated_at.toISOString(),
      trackingNumber: order.tracking_number || null,
      items: order.items,
      shippingAddress: order.shipping_address,
    },
  });
});

// POST /api/users/addresses
router.post('/addresses', async (req: AuthRequest, res: Response) => {
  const AddressSchema = z.object({
    label: z.string().default('Home'),
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(1, 'Zip code is required'),
    country: z.string().default('US'),
    isDefault: z.boolean().default(false),
  });

  const parsed = AddressSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.errors[0]?.message });
    return;
  }

  const { label, street, city, state, zipCode, country, isDefault } = parsed.data;

  if (isDefault) {
    await prisma.address.updateMany({
      where: { user_id: req.userId },
      data: { is_default: false },
    });
  }

  const address = await prisma.address.create({
    data: {
      user_id: req.userId!,
      label,
      street,
      city,
      state,
      zip_code: zipCode,
      country,
      is_default: isDefault,
    },
  });

  res.status(201).json({
    success: true,
    address: {
      id: address.id,
      label: address.label,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zip_code,
      country: address.country,
      isDefault: address.is_default,
    },
  });
});

// DELETE /api/users/addresses/:id
router.delete('/addresses/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const address = await prisma.address.findUnique({ where: { id } });
  if (!address || address.user_id !== req.userId) {
    res.status(404).json({ success: false, error: 'Address not found' });
    return;
  }

  await prisma.address.delete({ where: { id } });
  res.json({ success: true, message: 'Address deleted' });
});

export default router;
