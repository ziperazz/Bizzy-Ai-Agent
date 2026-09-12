// src/modules/products/product.service.js
import { Product } from './product.model.js';
import { ApiError } from '../../utils/ApiError.js';

export async function listProducts({ limit = 50, skip = 0, category, search, activeOnly = true } = {}) {
    const filter = {};
    if (activeOnly) filter.isActive = true;
    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };

    const [items, total] = await Promise.all([
        Product.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Math.min(limit, 200))
            .lean({ virtuals: true }),
        Product.countDocuments(filter),
    ]);

    return { items, total };
}

export async function getProductById(id) {
    const product = await Product.findById(id);
    if (!product) throw ApiError.notFound('Product not found');
    return product;
}

export async function getLowStockProducts(threshold = 5) {
    return Product.find({
        isActive: true,
        $expr: { $lte: ['$stock', threshold] },
    })
        .sort({ stock: 1 })
        .lean({ virtuals: true });
}