import { Router, Request, Response } from 'express';
import { createOrder, getUserOrders, getOrderById, updateOrderStatus } from '../controllers/orderController';
import { authenticate, optionalAuthenticate } from '../middlewares/auth';
import prisma from '../lib/prisma';

const router = Router();

// GET /api/orders/track?orderId=xxx&email=xxx  (public — no auth required)
// Works for both guest orders (guest_email) and authenticated user orders (user.email)
router.get('/track', async (req: Request, res: Response) => {
  const { orderId, email } = req.query;

  if (!orderId || !email || typeof orderId !== 'string' || typeof email !== 'string') {
    res.status(400).json({ success: false, error: 'orderId and email are required' });
    return;
  }

  // Accept both the full cuid and the 8-char short display ID (last 8 chars, case-insensitive)
  const order = await prisma.order.findFirst({
    where: {
      OR: [
        { id: orderId },
        { id: { endsWith: orderId.toLowerCase(), mode: 'insensitive' } },
      ],
    },
    include: { user: { select: { email: true } } },
  });

  if (!order) {
    res.status(404).json({ success: false, error: 'Order not found' });
    return;
  }

  const normalizedEmail = email.toLowerCase().trim();
  const guestEmailMatch = order.guest_email?.toLowerCase() === normalizedEmail;
  const userEmailMatch = order.user?.email.toLowerCase() === normalizedEmail;

  if (!guestEmailMatch && !userEmailMatch) {
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
      trackingNumber: order.tracking_number || null,
      items: order.items,
      shippingAddress: order.shipping_address,
    },
  });
});

// GET /api/orders - get user's orders (auth required)
router.get('/', authenticate, getUserOrders);

// GET /api/orders/:id - get order by ID (auth required)
router.get('/:id', authenticate, getOrderById);

// POST /api/orders - create order (supports both authenticated + guest checkout)
router.post('/', optionalAuthenticate, createOrder);

// PATCH /api/orders/:id/status - update order status (auth required)
router.patch('/:id/status', authenticate, updateOrderStatus);

export default router;
