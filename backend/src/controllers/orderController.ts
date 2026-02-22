import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { createError } from '../middlewares/errorHandler';

type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Refunded';

// Valid state transitions
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  Pending: ['Confirmed', 'Cancelled'],
  Confirmed: ['Processing', 'Cancelled'],
  Processing: ['Shipped', 'Cancelled'],
  Shipped: ['Delivered'],
  Delivered: ['Refunded'],
  Cancelled: [],
  Refunded: [],
};

const getUserId = (req: Request): string => {
  const header = req.headers['x-user-id'];
  const userId = Array.isArray(header) ? header[0] : header;
  if (!userId) throw createError('x-user-id header is required', 400);
  return userId;
};

const shippingAddressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip: z.string().min(1, 'ZIP code is required'),
  country: z.string().min(1, 'Country is required'),
});

const createOrderSchema = z.object({
  shippingAddress: shippingAddressSchema,
});

const updateOrderStatusSchema = z.object({
  status: z.enum(['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded']),
});

export const createOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = getUserId(req);
    const body = createOrderSchema.parse(req.body);

    // Get cart items with product details
    const cartItems = await prisma.cart.findMany({
      where: { user_id: userId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      next(createError('Cart is empty. Add items before placing an order.', 400));
      return;
    }

    // Build order items snapshot and compute total
    const orderItems = cartItems.map((item) => ({
      productId: item.product_id,
      name: item.product.name,
      price: Number(item.product.price),
      quantity: item.quantity,
    }));

    const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Create order and clear cart in a single transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          user_id: userId,
          total_amount: totalAmount,
          status: 'Pending',
          shipping_address: body.shippingAddress,
          items: orderItems,
        },
      });

      // Clear user's cart (stock was already decremented when items were added)
      await tx.cart.deleteMany({ where: { user_id: userId } });

      return newOrder;
    });

    console.log(`[ORDERS] createOrder: order ${order.id} created for user ${userId}, total $${totalAmount.toFixed(2)}`);
    res.status(201).json(order);
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(createError(error.errors.map((e) => e.message).join(', '), 400));
      return;
    }
    next(error);
  }
};

export const getUserOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = getUserId(req);

    const orders = await prisma.order.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });

    console.log(`[ORDERS] getUserOrders: user ${userId} has ${orders.length} orders`);
    res.json({ orders });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order || order.user_id !== userId) {
      next(createError(`Order with id '${id}' not found`, 404));
      return;
    }

    console.log(`[ORDERS] getOrderById: found order ${id} for user ${userId}`);
    res.json(order);
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    const body = updateOrderStatusSchema.parse(req.body);

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order || order.user_id !== userId) {
      next(createError(`Order with id '${id}' not found`, 404));
      return;
    }

    const currentStatus = order.status as OrderStatus;
    const validNext = VALID_TRANSITIONS[currentStatus];
    if (!validNext.includes(body.status)) {
      next(createError(`Cannot transition order from '${currentStatus}' to '${body.status}'`, 400));
      return;
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: body.status },
    });

    console.log(`[ORDERS] updateOrderStatus: order ${id} transitioned ${currentStatus} → ${body.status}`);
    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(createError(error.errors.map((e) => e.message).join(', '), 400));
      return;
    }
    next(error);
  }
};
