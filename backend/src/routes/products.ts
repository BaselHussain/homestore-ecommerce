import { Router } from 'express';
import { getAllProducts, getProductById } from '../controllers/productController';

const router = Router();

// GET /api/products - list with search/filter/sort/pagination
router.get('/', getAllProducts);

// GET /api/products/:id - get single product
router.get('/:id', getProductById);

export default router;
