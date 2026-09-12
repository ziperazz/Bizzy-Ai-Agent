// src/modules/tools/definitions/get-products.tool.js
import { z } from 'zod';
import { listProducts } from '../../products/product.service.js';
import { registerTool } from '../tools.registry.js';

const schema = z.object({
    search: z.string().trim().min(1).optional(),
    category: z.string().trim().min(1).optional(),
    limit: z.number().int().min(1).max(50).default(10),
});

registerTool({
    name: 'get_products',
    description:
        'Retrieve a list of products from the catalog. Use this to look up products by name, category, or to see what products exist.',
    jsonSchema: {
        type: 'object',
        properties: {
            search: {
                type: 'string',
                description: 'Optional search term to match product name or description.',
            },
            category: {
                type: 'string',
                description: 'Optional category filter (e.g. "electronics", "clothing").',
            },
            limit: {
                type: 'integer',
                description: 'Maximum number of products to return. Default 10, max 50.',
                minimum: 1,
                maximum: 50,
            },
        },
        required: [],
    },
    schema,
    allowedRoles: ['user', 'admin'],
    async execute(args) {
        const { items, total } = await listProducts({
            search: args.search,
            category: args.category,
            limit: args.limit,
        });

        return {
            total,
            count: items.length,
            products: items.map((p) => ({
                id: p._id,
                name: p.name,
                sku: p.sku,
                category: p.category,
                price: p.price,
                stock: p.stock,
                isLowStock: p.isLowStock ?? p.stock <= p.lowStockThreshold,
            })),
        };
    },
});