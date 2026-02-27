import { Router } from 'express';
import { createOrder, getUserOrders, getOrderById, updateOrderStatus } from '../controllers/orderController';
import { authenticate, optionalAuthenticate } from '../middlewares/auth';

const router = Router();

// GET /api/orders - get user's orders (auth required)
router.get('/', authenticate, getUserOrders);

// GET /api/orders/:id - get order by ID (auth required)
router.get('/:id', authenticate, getOrderById);

// POST /api/orders - create order (supports both authenticated + guest checkout)
router.post('/', optionalAuthenticate, createOrder);

// PATCH /api/orders/:id/status - update order status (auth required)
router.patch('/:id/status', authenticate, updateOrderStatus);

export default router;
