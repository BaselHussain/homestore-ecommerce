import { Router } from 'express';
import { adminOnly } from '../middlewares/adminOnly';

const router = Router();

// All admin routes require admin role
router.use(adminOnly);

// Placeholder routes - to be expanded with sub-routers:
// router.use('/stats', statsRouter);
// router.use('/products', adminProductsRouter);
// router.use('/orders', adminOrdersRouter);
// router.use('/users', adminUsersRouter);
// router.use('/analytics', adminAnalyticsRouter);
// router.use('/invoices', adminInvoicesRouter);

// Temporary stub endpoints for Phase 2 frontend connectivity
import { Request, Response } from 'express';
import { AdminRequest } from '../middlewares/adminOnly';
import prisma from '../lib/prisma';

function normalizeImageUrl(url: string): string {
  return url; // keep full URLs (Cloudinary https://... must not be stripped)
}

// GET /api/admin/stats
router.get('/stats', async (_req: Request, res: Response) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalUsers,
    totalProducts,
    allOrders,
    salesToday,
    salesWeek,
    salesMonth,
    lowStockProducts,
    recentOrders,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.order.aggregate({ _sum: { total_amount: true }, where: { status: { not: 'cancelled' }, created_at: { gte: startOfToday } } }),
    prisma.order.aggregate({ _sum: { total_amount: true }, where: { status: { not: 'cancelled' }, created_at: { gte: startOfWeek } } }),
    prisma.order.aggregate({ _sum: { total_amount: true }, where: { status: { not: 'cancelled' }, created_at: { gte: startOfMonth } } }),
    prisma.product.findMany({ where: { stock: { lt: 5 } }, select: { id: true, name: true, stock: true, category: true }, orderBy: { stock: 'asc' } }),
    prisma.order.findMany({
      take: 10,
      orderBy: { created_at: 'desc' },
      include: { user: { select: { email: true, name: true } } },
    }),
  ]);

  const orderCounts: Record<string, number> = {};
  for (const g of allOrders) {
    orderCounts[g.status] = g._count._all;
  }

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalProducts,
      totalOrders: allOrders.reduce((s, g) => s + g._count._all, 0),
      ordersByStatus: {
        pending: orderCounts['pending'] ?? 0,
        processing: orderCounts['processing'] ?? 0,
        shipped: orderCounts['shipped'] ?? 0,
        delivered: orderCounts['delivered'] ?? 0,
        cancelled: orderCounts['cancelled'] ?? 0,
      },
      totalSales: {
        today: Number(salesToday._sum.total_amount ?? 0),
        week: Number(salesWeek._sum.total_amount ?? 0),
        month: Number(salesMonth._sum.total_amount ?? 0),
      },
      lowStockProducts,
      recentOrders,
    },
  });
});

// GET /api/admin/products
router.get('/products', async (req: Request, res: Response) => {
  const page = parseInt(String(req.query.page ?? '1'));
  const limit = parseInt(String(req.query.limit ?? '20'));
  const skip = (page - 1) * limit;
  const search = req.query.search as string | undefined;
  const category = req.query.category as string | undefined;

  const where: Record<string, unknown> = {};
  if (search) where.name = { contains: search, mode: 'insensitive' };
  if (category) where.category = category;

  const [products, total] = await Promise.all([
    prisma.product.findMany({ where, skip, take: limit, orderBy: { created_at: 'desc' } }),
    prisma.product.count({ where }),
  ]);

  res.json({ success: true, products, total, page, limit });
});

// POST /api/admin/products
router.post('/products', async (req: Request, res: Response) => {
  const { name, description, price, originalPrice, stock, category, badge, images, itemCode } = req.body;
  const product = await prisma.product.create({
    data: { name, description, price, originalPrice, stock, category, badge, images: (images ?? []).map(normalizeImageUrl), itemCode },
  });
  res.status(201).json({ success: true, product });
});

// PUT /api/admin/products/:id
router.put('/products/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, price, originalPrice, stock, category, badge, images, itemCode } = req.body;
  const product = await prisma.product.update({
    where: { id },
    data: { name, description, price, originalPrice, stock, category, badge, images: (images ?? []).map(normalizeImageUrl), itemCode },
  });
  res.json({ success: true, product });
});

// POST /api/admin/products/bulk
router.post('/products/bulk', async (req: Request, res: Response) => {
  const { products } = req.body;
  if (!Array.isArray(products) || products.length === 0) {
    res.status(400).json({ success: false, error: 'No products provided' }); return;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = products.map((p: any) => ({
    name: String(p.name),
    description: String(p.description || ''),
    price: parseFloat(p.price),
    originalPrice: p.originalPrice ? parseFloat(p.originalPrice) : null,
    stock: parseInt(p.stock) || 0,
    category: String(p.category),
    badge: p.badge || null,
    itemCode: p.itemCode || null,
    images: String(p.images || '').split('|').map(normalizeImageUrl).filter(Boolean),
  }));
  const result = await prisma.product.createMany({ data, skipDuplicates: true });
  res.json({ success: true, created: result.count });
});

// DELETE /api/admin/products/:id
router.delete('/products/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.product.delete({ where: { id } });
  res.json({ success: true, message: 'Product deleted' });
});

// GET /api/admin/orders
router.get('/orders', async (req: Request, res: Response) => {
  const page = parseInt(String(req.query.page ?? '1'));
  const limit = parseInt(String(req.query.limit ?? '20'));
  const skip = (page - 1) * limit;
  const status = req.query.status as string | undefined;

  const where = status ? { status } : {};

  const [orders, total] = await Promise.all([
    prisma.order.findMany({ where, skip, take: limit, orderBy: { created_at: 'desc' }, include: { user: { select: { email: true, name: true } } } }),
    prisma.order.count({ where }),
  ]);

  res.json({ success: true, orders, total, page, limit });
});

// PATCH /api/admin/orders/:id/status
router.patch('/orders/:id/status', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ success: false, error: 'Invalid status' });
    return;
  }
  const order = await prisma.order.update({ where: { id }, data: { status } });
  res.json({ success: true, order });
});

// GET /api/admin/users
router.get('/users', async (req: Request, res: Response) => {
  const page = parseInt(String(req.query.page ?? '1'));
  const limit = parseInt(String(req.query.limit ?? '20'));
  const skip = (page - 1) * limit;
  const search = req.query.search as string | undefined;

  const where = search ? { email: { contains: search, mode: 'insensitive' as const } } : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      select: { id: true, email: true, name: true, role: true, isBanned: true, created_at: true, last_login_at: true },
    }),
    prisma.user.count({ where }),
  ]);

  res.json({ success: true, users, total, page, limit });
});

// PATCH /api/admin/users/:id/ban
router.patch('/users/:id/ban', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isBanned } = req.body;
  const user = await prisma.user.update({
    where: { id },
    data: { isBanned },
    select: { id: true, email: true, name: true, role: true, isBanned: true },
  });
  res.json({ success: true, user });
});

// GET /api/admin/analytics
router.get('/analytics', async (req: Request, res: Response) => {
  const period = (req.query.period as string) || '30d';
  const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [orders, newUsersInPeriod, products, allOrderStatuses, usersInPeriod] = await Promise.all([
    prisma.order.findMany({
      where: { created_at: { gte: since } },
      select: { total_amount: true, status: true, created_at: true },
      orderBy: { created_at: 'asc' },
    }),
    prisma.user.count({ where: { created_at: { gte: since } } }),
    prisma.product.findMany({ select: { category: true } }),
    prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.user.findMany({
      where: { created_at: { gte: since } },
      select: { created_at: true },
      orderBy: { created_at: 'asc' },
    }),
  ]);

  // Daily revenue chart data
  const dailyMap: Record<string, number> = {};
  for (const order of orders) {
    if (order.status !== 'cancelled') {
      const day = order.created_at.toISOString().slice(0, 10);
      dailyMap[day] = (dailyMap[day] ?? 0) + Number(order.total_amount);
    }
  }
  const revenueData = Object.entries(dailyMap).map(([date, revenue]) => ({ date, revenue }));

  // Category distribution
  const catMap: Record<string, number> = {};
  for (const p of products) {
    catMap[p.category] = (catMap[p.category] ?? 0) + 1;
  }
  const categoryData = Object.entries(catMap).map(([name, count]) => ({ name, count }));

  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + Number(o.total_amount), 0);

  // Order status breakdown (all-time, for pie chart)
  const orderStatusData = allOrderStatuses.map(g => ({
    name: g.status.charAt(0).toUpperCase() + g.status.slice(1),
    value: g._count._all,
  }));

  // Daily user growth for the period
  const userGrowthMap: Record<string, number> = {};
  for (const u of usersInPeriod) {
    const day = u.created_at.toISOString().slice(0, 10);
    userGrowthMap[day] = (userGrowthMap[day] ?? 0) + 1;
  }
  const userGrowthData = Object.entries(userGrowthMap).map(([date, newUsers]) => ({ date, newUsers }));

  res.json({
    success: true,
    analytics: {
      totalRevenue,
      totalOrders: orders.length,
      newUsers: newUsersInPeriod,
      revenueData,
      categoryData,
      orderStatusData,
      userGrowthData,
      period,
    },
  });
});

// GET /api/admin/invoices
router.get('/invoices', async (req: Request, res: Response) => {
  const page = parseInt(String(req.query.page ?? '1'));
  const limit = parseInt(String(req.query.limit ?? '20'));
  const skip = (page - 1) * limit;
  const startDate = req.query.startDate as string | undefined;
  const endDate = req.query.endDate as string | undefined;

  const where: Record<string, unknown> = {};
  if (startDate || endDate) {
    where.created_at = {
      ...(startDate ? { gte: new Date(startDate) } : {}),
      ...(endDate ? { lte: new Date(endDate + 'T23:59:59Z') } : {}),
    };
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        user_id: true,
        guest_email: true,
        total_amount: true,
        status: true,
        created_at: true,
        items: true,
        shipping_address: true,
      },
    }),
    prisma.order.count({ where }),
  ]);

  res.json({ success: true, invoices: orders, total, page, limit });
});

// POST /api/admin/invoices/generate
router.post('/invoices/generate', async (req: Request, res: Response) => {
  const { orderId } = req.body;
  if (!orderId) {
    res.status(400).json({ success: false, error: 'orderId required' });
    return;
  }
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    res.status(404).json({ success: false, error: 'Order not found' });
    return;
  }
  res.json({ success: true, invoice: { orderId: order.id, generated: true } });
});

export default router;
