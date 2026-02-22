import { Router } from 'express';
import { addItemToWishlist, getWishlistItems, removeItemFromWishlist } from '../controllers/wishlistController';

const router = Router();

// GET /api/wishlist - get user's wishlist
router.get('/', getWishlistItems);

// POST /api/wishlist - add item to wishlist
router.post('/', addItemToWishlist);

// DELETE /api/wishlist/:id - remove item from wishlist
router.delete('/:id', removeItemFromWishlist);

export default router;
