// src/modules/sales/sale.service.js
import { Sale } from './sale.model.js';

/**
 * گزارش فروش در یک بازه زمانی.
 * @param {object} params
 * @param {Date} [params.from]
 * @param {Date} [params.to]
 * @param {string} [params.status='paid']
 */
export async function getSalesReport({ from, to, status = 'paid' } = {}) {
    const match = { status };
    if (from || to) {
        match.soldAt = {};
        if (from) match.soldAt.$gte = from;
        if (to) match.soldAt.$lte = to;
    }

    const [summary] = await Sale.aggregate([
        { $match: match },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: '$finalAmount' },
                totalOrders: { $sum: 1 },
                avgOrderValue: { $avg: '$finalAmount' },
                totalItemsSold: { $sum: { $sum: '$items.quantity' } },
            },
        },
    ]);

    const topProducts = await Sale.aggregate([
        { $match: match },
        { $unwind: '$items' },
        {
            $group: {
                _id: '$items.product',
                name: { $first: '$items.productName' },
                quantity: { $sum: '$items.quantity' },
                revenue: { $sum: '$items.total' },
            },
        },
        { $sort: { revenue: -1 } },
        { $limit: 10 },
    ]);

    const daily = await Sale.aggregate([
        { $match: match },
        {
            $group: {
                _id: {
                    $dateToString: { format: '%Y-%m-%d', date: '$soldAt' },
                },
                revenue: { $sum: '$finalAmount' },
                orders: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
    ]);

    return {
        range: { from: from ?? null, to: to ?? null },
        summary: summary ?? {
            totalRevenue: 0,
            totalOrders: 0,
            avgOrderValue: 0,
            totalItemsSold: 0,
        },
        topProducts,
        daily,
    };
}