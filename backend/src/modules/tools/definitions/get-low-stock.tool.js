// src/modules/tools/definitions/get-low-stock.tool.js
import { z } from 'zod';
import { getLowStockProducts } from '../../products/product.service.js';
import { registerTool } from '../tools.registry.js';

const schema = z.object({
    threshold: z.number().int().min(0).max(1000).default(5),
});

registerTool({
    name: 'get_low_stock_products',
    description:
        'Find products whose stock is at or below a threshold. Use this to identify items that need restocking.',
    jsonSchema: {
        type: 'object',
        properties: {
            threshold: {
                type: 'integer',
                description: 'Stock level threshold. Products with stock <= threshold will be returned. Default 5.',
                minimum: 0,
                maximum: 1000,
            },
        },
        required: [],
    },
    schema,
    allowedRoles: ['user', 'admin'],
    async execute(args) {
        const items = await getLowStockProducts(args.threshold);
        return {
            threshold: args.threshold,
            count: items.length,
            products: items.map((p) => ({
                id: p._id,
                name: p.name,
                sku: p.sku,
                stock: p.stock,
                threshold: p.lowStockThreshold,
            })),
        };
    },
});