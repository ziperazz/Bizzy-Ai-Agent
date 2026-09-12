// src/modules/tools/definitions/get-sales-report.tool.js
import { z } from 'zod';
import { getSalesReport } from '../../sales/sale.service.js';
import { registerTool } from '../tools.registry.js';
import { ApiError } from '../../../utils/ApiError.js';

const schema = z.object({
    period: z
        .enum(['today', 'yesterday', 'this_week', 'this_month', 'last_month', 'this_year', 'custom'])
        .default('this_month'),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
});

function computeRange({ period, from, to }) {
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
            const day = d.getDay(); // 0=sun
            const diff = (day + 1) % 7; // Monday as start
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
            if (!from || !to) throw ApiError.badRequest('`from` and `to` are required for custom period');
            return { from: new Date(from), to: new Date(to) };
        default:
            return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: now };
    }
}

registerTool({
    name: 'get_sales_report',
    description:
        'Get a sales report for a specific period. Returns total revenue, order count, average order value, top selling products, and daily breakdown.',
    jsonSchema: {
        type: 'object',
        properties: {
            period: {
                type: 'string',
                enum: ['today', 'yesterday', 'this_week', 'this_month', 'last_month', 'this_year', 'custom'],
                description: 'Time period for the report. Use "custom" with `from` and `to` ISO dates for arbitrary ranges.',
            },
            from: {
                type: 'string',
                description: 'Start date in ISO 8601 format (required only for period=custom).',
            },
            to: {
                type: 'string',
                description: 'End date in ISO 8601 format (required only for period=custom).',
            },
        },
        required: [],
    },
    schema,
    allowedRoles: ['user', 'admin'],
    async execute(args) {
        const { from, to } = computeRange(args);
        return getSalesReport({ from, to, status: 'paid' });
    },
});