import { Router } from 'express';
import { createOrder, getUserOrders, getOrderById, updateOrderStatus } from '../controllers/orderController';

const router = Router();

// GET /api/orders - get user's orders
router.get('/', getUserOrders);

// GET /api/orders/:id - get order by ID
router.get('/:id', getOrderById);

// POST /api/orders - create order from cart
router.post('/', createOrder);

// PATCH /api/orders/:id/status - update order status (state machine)
router.patch('/:id/status', updateOrderStatus);

export default router;
