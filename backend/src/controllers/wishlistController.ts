import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { createError } from '../middlewares/errorHandler';

const getUserId = (req: Request): string => {
  const header = req.headers['x-user-id'];
  const userId = Array.isArray(header) ? header[0] : header;
  if (!userId) throw createError('x-user-id header is required', 400);
  return userId;
};

const addWishlistSchema = z.object({
  productId: z.string().min(1, 'productId is required'),
});

export const addItemToWishlist = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = getUserId(req);
    const body = addWishlistSchema.parse(req.body);

    const product = await prisma.product.findUnique({ where: { id: body.productId } });
    if (!product) {
      next(createError(`Product with id '${body.productId}' not found`, 404));
      return;
    }

    // Upsert: if already in wishlist, return existing item (idempotent)
    const item = await prisma.wishlist.upsert({
      where: {
        user_id_product_id: { user_id: userId, product_id: body.productId },
      },
      update: {},
      create: {
        user_id: userId,
        product_id: body.productId,
      },
      include: { product: true },
    });

    console.log(`[WISHLIST] addItem: user ${userId} saved '${product.name}'`);
    res.status(200).json(item);
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(createError(error.errors.map((e) => e.message).join(', '), 400));
      return;
    }
    next(error);
  }
};

export const getWishlistItems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = getUserId(req);

    const items = await prisma.wishlist.findMany({
      where: { user_id: userId },
      include: { product: true },
      orderBy: { created_at: 'desc' },
    });

    console.log(`[WISHLIST] getItems: user ${userId} has ${items.length} items`);
    res.json({ items });
  } catch (error) {
    next(error);
  }
};

export const removeItemFromWishlist = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    const existing = await prisma.wishlist.findUnique({ where: { id } });
    if (!existing || existing.user_id !== userId) {
      next(createError('Wishlist item not found', 404));
      return;
    }

    await prisma.wishlist.delete({ where: { id } });

    console.log(`[WISHLIST] removeItem: removed item ${id} for user ${userId}`);
    res.json({ message: 'Item removed from wishlist' });
  } catch (error) {
    next(error);
  }
};
