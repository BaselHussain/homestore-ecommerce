import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { createError } from '../middlewares/errorHandler';

// Validation schemas
const productQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  sort: z.enum(['price_asc', 'price_desc', 'name_asc', 'name_desc', 'created_at_desc']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().positive('Price must be positive'),
  stock: z.number().int().nonnegative('Stock must be non-negative'),
  category: z.string().min(1, 'Category is required'),
  images: z.array(z.string().url('Each image must be a valid URL')).min(1, 'At least one image is required'),
});

export const getAllProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = productQuerySchema.parse(req.query);
    const skip = (query.page - 1) * query.limit;

    // Build where clause for search/filter
    const where: Record<string, unknown> = {};
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.category) {
      where.category = { equals: query.category, mode: 'insensitive' };
    }

    // Build orderBy
    const orderByMap: Record<string, Record<string, string>> = {
      price_asc: { price: 'asc' },
      price_desc: { price: 'desc' },
      name_asc: { name: 'asc' },
      name_desc: { name: 'desc' },
      created_at_desc: { created_at: 'desc' },
    };
    const orderBy = query.sort ? orderByMap[query.sort] : { created_at: 'desc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: query.limit,
      }),
      prisma.product.count({ where }),
    ]);

    console.log(`[PRODUCTS] getAllProducts: returned ${products.length} of ${total} products`);

    res.json({
      data: products,
      pagination: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(createError(error.errors.map((e) => e.message).join(', '), 400));
      return;
    }
    next(error);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      next(createError(`Product with id '${id}' not found`, 404));
      return;
    }

    console.log(`[PRODUCTS] getProductById: found product '${product.name}'`);
    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const body = createProductSchema.parse(req.body);

    const product = await prisma.product.create({
      data: {
        name: body.name,
        description: body.description,
        price: body.price,
        stock: body.stock,
        category: body.category,
        images: body.images,
      },
    });

    console.log(`[PRODUCTS] createProduct: created '${product.name}' (id: ${product.id})`);
    res.status(201).json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(createError(error.errors.map((e) => e.message).join(', '), 400));
      return;
    }
    next(error);
  }
};
