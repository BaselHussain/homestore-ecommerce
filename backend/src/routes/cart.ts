import { Router } from 'express';
import { addCartItem, getCartItems, updateCartItem, removeCartItem } from '../controllers/cartController';

const router = Router();

// GET /api/cart - get user's cart
router.get('/', getCartItems);

// POST /api/cart - add item to cart
router.post('/', addCartItem);

// PUT /api/cart/:id - update cart item quantity
router.put('/:id', updateCartItem);

// DELETE /api/cart/:id - remove cart item
router.delete('/:id', removeCartItem);

export default router;
