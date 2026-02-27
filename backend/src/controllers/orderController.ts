import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { createError } from '../middlewares/errorHandler';
import { AuthRequest } from '../middlewares/auth';

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

const getUserId = (req: AuthRequest): string => {
  if (!req.userId) throw createError('Authentication required', 401);
  return req.userId;
};

const shippingAddressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip: z.string().min(1, 'ZIP code is required'),
  country: z.string().min(1, 'Country is required'),
});

const orderItemSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
});

const createOrderSchema = z.object({
  shippingAddress: shippingAddressSchema,
  guestEmail: z.string().email().optional(),
  items: z.array(orderItemSchema).optional(),
  total: z.number().positive().optional(),
});

const updateOrderStatusSchema = z.object({
  status: z.enum(['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded']),
});

export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const body = createOrderSchema.parse(req.body);
    const userId = req.userId ?? null;

    let orderItems: { productId: string; name: string; price: number; quantity: number }[];
    let totalAmount: number;

    if (userId) {
      // Authenticated: load items from DB cart
      const cartItems = await prisma.cart.findMany({
        where: { user_id: userId },
        include: { product: true },
      });

      if (cartItems.length === 0) {
        next(createError('Cart is empty. Add items before placing an order.', 400));
        return;
      }

      orderItems = cartItems.map((item) => ({
        productId: item.product_id,
        name: item.product.name,
        price: Number(item.product.price),
        quantity: item.quantity,
      }));
      totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    } else {
      // Guest: items + guestEmail must be in body
      if (!body.guestEmail) {
        next(createError('Guest email is required for guest checkout', 400));
        return;
      }
      if (!body.items || body.items.length === 0) {
        next(createError('Order items are required for guest checkout', 400));
        return;
      }
      orderItems = body.items;
      totalAmount = body.total ?? orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }

    // Create order and (for authenticated users) clear cart in a transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          user_id: userId,
          guest_email: userId ? null : body.guestEmail,
          total_amount: totalAmount,
          status: 'Confirmed', // simulate immediate payment confirmation
          shipping_address: body.shippingAddress,
          items: orderItems,
        },
      });

      if (userId) {
        await tx.cart.deleteMany({ where: { user_id: userId } });
      }

      return newOrder;
    });

    const who = userId ? `user ${userId}` : `guest ${body.guestEmail}`;
    console.log(`[ORDERS] createOrder: order ${order.id} created for ${who}, total $${totalAmount.toFixed(2)}`);
    res.status(201).json(order);
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(createError(error.errors.map((e) => e.message).join(', '), 400));
      return;
    }
    next(error);
  }
};

export const getUserOrders = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
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

export const getOrderById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
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

export const updateOrderStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
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
