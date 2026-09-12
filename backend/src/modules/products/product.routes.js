// src/modules/products/product.routes.js
import { Router } from 'express';
import * as controller from './product.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';

const router = Router();

router.use(requireAuth);

// عمومی
router.get('/', controller.listProducts);
router.get('/low-stock', controller.getLowStock);
router.get('/:id', controller.getProduct);

// فقط admin
router.post('/', requireRole('admin'), controller.createProduct);
router.patch('/:id', requireRole('admin'), controller.updateProduct);
router.delete('/:id', requireRole('admin'), controller.deleteProduct);

export default router;