import { Router } from 'express';
import { getAllProducts, getProductById, createProduct } from '../controllers/productController';

const router = Router();

// GET /api/products - list with search/filter/sort/pagination
router.get('/', getAllProducts);

// GET /api/products/:id - get single product
router.get('/:id', getProductById);

// POST /api/products - create product (admin only placeholder)
router.post('/', createProduct);

export default router;
