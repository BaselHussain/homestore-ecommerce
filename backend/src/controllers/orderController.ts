import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { createError } from '../middlewares/errorHandler';
import { AuthRequest } from '../middlewares/auth';
import { validateCoupon } from '../routes/coupons';
import { sendOrderConfirmation } from '../lib/email';

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
  couponCode: z.string().optional(),
  discountAmount: z.number().min(0).optional(),
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

      // Re-fetch actual prices from DB — never trust client-provided prices
      const guestProductIds = body.items.map((i) => i.productId);
      const dbProducts = await prisma.product.findMany({
        where: { id: { in: guestProductIds } },
        select: { id: true, name: true, price: true },
      });
      const productMap = new Map(dbProducts.map((p) => [p.id, p]));

      const missingProducts = guestProductIds.filter((id) => !productMap.has(id));
      if (missingProducts.length > 0) {
        next(createError('One or more products not found', 400));
        return;
      }

      orderItems = body.items.map((item) => {
        const dbProduct = productMap.get(item.productId)!;
        return {
          productId: item.productId,
          name: dbProduct.name,
          price: Number(dbProduct.price), // DB price, not client price
          quantity: item.quantity,
        };
      });
      totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }

    // Stock validation — check availability before placing order
    const productIds = orderItems.filter((i) => i.productId).map((i) => i.productId);
    if (productIds.length > 0) {
      const stockedProducts = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, stock: true },
      });
      const insufficient: string[] = [];
      for (const item of orderItems) {
        if (!item.productId) continue;
        const p = stockedProducts.find((sp) => sp.id === item.productId);
        if (p && p.stock < item.quantity) insufficient.push(p.name);
      }
      if (insufficient.length > 0) {
        next(createError(`Insufficient stock for: ${insufficient.join(', ')}`, 400));
        return;
      }
    }

    // Server-side coupon re-validation (prevents race conditions / stale client state)
    let appliedCouponCode: string | null = null;
    let appliedDiscountAmount: number = 0;

    if (body.couponCode) {
      const couponResult = await validateCoupon(body.couponCode, totalAmount);
      if ('error' in couponResult) {
        next(createError(couponResult.message, 400));
        return;
      }
      appliedCouponCode = couponResult.coupon.code;
      appliedDiscountAmount = couponResult.discountAmount;
      totalAmount = parseFloat((totalAmount - appliedDiscountAmount).toFixed(2));
    }

    // Create order (and increment coupon usage count) in a single transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          user_id: userId,
          guest_email: userId ? null : body.guestEmail,
          total_amount: totalAmount,
          status: 'Confirmed', // simulate immediate payment confirmation
          shipping_address: body.shippingAddress,
          items: orderItems,
          coupon_code: appliedCouponCode,
          discount_amount: appliedDiscountAmount > 0 ? appliedDiscountAmount : null,
        },
      });

      if (userId) {
        await tx.cart.deleteMany({ where: { user_id: userId } });
      }

      if (appliedCouponCode) {
        await tx.coupon.update({
          where: { code: appliedCouponCode },
          data: { usage_count: { increment: 1 } },
        });
      }

      // Decrement stock for each item with a productId
      for (const item of orderItems) {
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      return newOrder;
    });

    const who = userId ? `user ${userId}` : `guest ${body.guestEmail}`;
    const couponLog = appliedCouponCode ? ` with coupon ${appliedCouponCode} (−€${appliedDiscountAmount.toFixed(2)})` : '';
    console.log(`[ORDERS] createOrder: order ${order.id} created for ${who}, total €${totalAmount.toFixed(2)}${couponLog}`);

    // Fire-and-forget confirmation email
    const emailTo = userId
      ? await prisma.user.findUnique({ where: { id: userId }, select: { email: true } }).then((u) => u?.email ?? null)
      : body.guestEmail ?? null;
    if (emailTo) {
      void sendOrderConfirmation(emailTo, {
        id: order.id,
        total_amount: Number(order.total_amount),
        status: order.status,
        shipping_address: order.shipping_address as { street: string; city: string; state: string; zip: string; country: string },
        items: orderItems,
        coupon_code: order.coupon_code,
        discount_amount: order.discount_amount ? Number(order.discount_amount) : null,
      });
    }

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

    // Users may only cancel their own orders — all other transitions are admin-only
    if (body.status !== 'Cancelled') {
      next(createError('Users may only cancel orders. Use the admin panel for other status changes.', 403));
      return;
    }

    const currentStatus = order.status as OrderStatus;
    const validNext = VALID_TRANSITIONS[currentStatus];
    if (!validNext.includes(body.status)) {
      next(createError(`Cannot transition order from '${currentStatus}' to '${body.status}'`, 400));
      return;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id },
        data: { status: body.status },
      });

      // Decrement coupon usage count when an order is cancelled or refunded
      if ((body.status === 'Cancelled' || body.status === 'Refunded') && order.coupon_code) {
        await tx.coupon.updateMany({
          where: { code: order.coupon_code, usage_count: { gt: 0 } },
          data: { usage_count: { decrement: 1 } },
        });
      }

      // Restore stock when cancelled or refunded
      if (body.status === 'Cancelled' || body.status === 'Refunded') {
        const items = order.items as Array<{ productId?: string; quantity: number }>;
        for (const item of items) {
          if (item.productId) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }
      }

      return updatedOrder;
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
