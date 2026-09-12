// src/modules/sales/sale.routes.js
import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { successResponse } from '../../utils/apiResponse.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { getSalesReport } from './sale.service.js';
import { Sale } from './sale.model.js';

const router = Router();

router.use(requireAuth);

router.get(
    '/report',
    asyncHandler(async (req, res) => {
        const { period = 'this_month', from, to } = req.query;
        const { from: f, to: t } = computeRange(period, from, to);
        const report = await getSalesReport({ from: f, to: t });
        return successResponse(res, report);
    })
);

router.get(
    '/',
    requireRole('admin'),
    asyncHandler(async (req, res) => {
        const limit = Number(req.query.limit ?? 20);
        const skip = Number(req.query.skip ?? 0);
        const [items, total] = await Promise.all([
            Sale.find().sort({ soldAt: -1 }).skip(skip).limit(limit).lean(),
            Sale.countDocuments(),
        ]);
        return successResponse(res, items, { meta: { total } });
    })
);

router.get(
    '/:id',
    requireRole('admin'),
    asyncHandler(async (req, res) => {
        const sale = await Sale.findById(req.params.id).lean();
        if (!sale) {
            return res.status(404).json({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Sale not found' },
            });
        }
        return successResponse(res, sale);
    })
);

function computeRange(period, from, to) {
    const now = new Date();
    const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

    switch (period) {
        case 'today':
            return { from: startOfDay(now), to: now };
        case 'yesterday': {
            const y = new Date(now);
            y.setDate(y.getDate() - 1);
            return { from: startOfDay(y), to: startOfDay(now) };
        }
        case 'this_week': {
            const d = new Date(now);
            const day = d.getDay();
            const diff = (day + 1) % 7;
            d.setDate(d.getDate() - diff);
            return { from: startOfDay(d), to: now };
        }
        case 'this_month':
            return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: now };
        case 'last_month':
            return {
                from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
                to: new Date(now.getFullYear(), now.getMonth(), 1),
            };
        case 'this_year':
            return { from: new Date(now.getFullYear(), 0, 1), to: now };
        case 'custom':
            return { from: from ? new Date(from) : null, to: to ? new Date(to) : now };
        default:
            return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: now };
    }
}

export default router;