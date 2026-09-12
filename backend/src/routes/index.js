// src/routes/index.js
import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import chatRoutes from '../modules/chat/chat.routes.js';
import taskRoutes from '../modules/tasks/task.routes.js';
import productRoutes from '../modules/products/product.routes.js';
import saleRoutes from '../modules/sales/sale.routes.js';
import settingsRoutes from '../modules/settings/settings.routes.js';

// اطمینان از ثبت toolها
import '../modules/tools/definitions/index.js';

const router = Router();

router.get('/health', (_req, res) => {
    res.json({
        success: true,
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});

router.use('/auth', authRoutes);
router.use('/chat', chatRoutes);
router.use('/tasks', taskRoutes);
router.use('/products', productRoutes);
router.use('/sales', saleRoutes);
router.use('/settings', settingsRoutes);

export default router;