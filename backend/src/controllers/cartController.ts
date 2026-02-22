import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { createError } from '../middlewares/errorHandler';

// 24-hour cart expiration in milliseconds
const CART_EXPIRY_MS = 24 * 60 * 60 * 1000;

// For this MVP, user_id is passed in headers/body as the API has no auth yet
// In a real app this would come from the JWT token
const getUserId = (req: Request): string => {
  const header = req.headers['x-user-id'];
  const userId = Array.isArray(header) ? header[0] : header;
  if (!userId) throw createError('x-user-id header is required', 400);
  return userId;
};

const addCartItemSchema = z.object({
  productId: z.string().min(1, 'productId is required'),
  quantity: z.number().int().positive('quantity must be a positive integer'),
});

const updateCartItemSchema = z.object({
  quantity: z.number().int().positive('quantity must be a positive integer'),
});

const expireCartItems = async (userId: string): Promise<void> => {
  const expiryDate = new Date(Date.now() - CART_EXPIRY_MS);

  // Find expired cart items to restore stock
  const expiredItems = await prisma.cart.findMany({
    where: { user_id: userId, created_at: { lt: expiryDate } },
  });

  if (expiredItems.length > 0) {
    await prisma.$transaction(async (tx) => {
      for (const item of expiredItems) {
        // Restore stock
        await tx.product.update({
          where: { id: item.product_id },
          data: { stock: { increment: item.quantity } },
        });
      }
      // Delete expired items
      await tx.cart.deleteMany({
        where: { user_id: userId, created_at: { lt: expiryDate } },
      });
    });

    console.log(`[CART] Expired and removed ${expiredItems.length} cart items for user ${userId}`);
  }
};

export const addCartItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = getUserId(req);
    const body = addCartItemSchema.parse(req.body);

    // Expire stale items first
    await expireCartItems(userId);

    // Verify product exists and has enough stock
    const product = await prisma.product.findUnique({ where: { id: body.productId } });
    if (!product) {
      next(createError(`Product with id '${body.productId}' not found`, 404));
      return;
    }
    if (product.stock < body.quantity) {
      next(createError(`Insufficient stock. Available: ${product.stock}`, 400));
      return;
    }

    // Check if product is already in cart — update quantity instead
    const existing = await prisma.cart.findFirst({
      where: { user_id: userId, product_id: body.productId },
    });

    let cartItem;
    if (existing) {
      const newQuantity = existing.quantity + body.quantity;
      const additionalNeeded = body.quantity;

      if (product.stock < additionalNeeded) {
        next(createError(`Insufficient stock to add ${body.quantity} more. Available: ${product.stock}`, 400));
        return;
      }

      cartItem = await prisma.$transaction(async (tx) => {
        await tx.product.update({
          where: { id: body.productId },
          data: { stock: { decrement: additionalNeeded } },
        });
        return tx.cart.update({
          where: { id: existing.id },
          data: { quantity: newQuantity },
          include: { product: true },
        });
      });
    } else {
      cartItem = await prisma.$transaction(async (tx) => {
        await tx.product.update({
          where: { id: body.productId },
          data: { stock: { decrement: body.quantity } },
        });
        return tx.cart.create({
          data: {
            user_id: userId,
            product_id: body.productId,
            quantity: body.quantity,
          },
          include: { product: true },
        });
      });
    }

    console.log(`[CART] addCartItem: user ${userId} added ${body.quantity}x '${product.name}'`);
    res.status(200).json(cartItem);
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(createError(error.errors.map((e) => e.message).join(', '), 400));
      return;
    }
    next(error);
  }
};

export const getCartItems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = getUserId(req);

    // Expire stale items first
    await expireCartItems(userId);

    const items = await prisma.cart.findMany({
      where: { user_id: userId },
      include: { product: true },
      orderBy: { created_at: 'desc' },
    });

    const total = items.reduce((sum, item) => {
      return sum + Number(item.product.price) * item.quantity;
    }, 0);

    console.log(`[CART] getCartItems: user ${userId} has ${items.length} items`);
    res.json({ items, total: parseFloat(total.toFixed(2)) });
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    const body = updateCartItemSchema.parse(req.body);

    const existing = await prisma.cart.findUnique({ where: { id } });
    if (!existing || existing.user_id !== userId) {
      next(createError('Cart item not found', 404));
      return;
    }

    const quantityDiff = body.quantity - existing.quantity;

    if (quantityDiff > 0) {
      // Need more stock
      const product = await prisma.product.findUnique({ where: { id: existing.product_id } });
      if (!product || product.stock < quantityDiff) {
        next(createError(`Insufficient stock. Available: ${product?.stock ?? 0}`, 400));
        return;
      }
    }

    const cartItem = await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: existing.product_id },
        data: { stock: { decrement: quantityDiff } },
      });
      return tx.cart.update({
        where: { id },
        data: { quantity: body.quantity },
        include: { product: true },
      });
    });

    console.log(`[CART] updateCartItem: updated item ${id} to quantity ${body.quantity}`);
    res.json(cartItem);
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(createError(error.errors.map((e) => e.message).join(', '), 400));
      return;
    }
    next(error);
  }
};

export const removeCartItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    const existing = await prisma.cart.findUnique({ where: { id } });
    if (!existing || existing.user_id !== userId) {
      next(createError('Cart item not found', 404));
      return;
    }

    await prisma.$transaction(async (tx) => {
      // Restore stock on removal
      await tx.product.update({
        where: { id: existing.product_id },
        data: { stock: { increment: existing.quantity } },
      });
      await tx.cart.delete({ where: { id } });
    });

    console.log(`[CART] removeCartItem: removed item ${id} for user ${userId}`);
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    next(error);
  }
};
