// src/modules/products/product.controller.js
import { z } from 'zod';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { successResponse } from '../../utils/apiResponse.js';
import * as productService from './product.service.js';
import { Product } from './product.model.js';
import { ApiError } from '../../utils/ApiError.js';

const createSchema = z.object({
    name: z.string().trim().min(2).max(200),
    sku: z.string().trim().min(2).max(50),
    description: z.string().trim().max(5000).optional().default(''),
    category: z.string().trim().max(100).optional().default('general'),
    price: z.number().nonnegative(),
    cost: z.number().nonnegative().optional(),
    stock: z.number().int().nonnegative(),
    lowStockThreshold: z.number().int().nonnegative().optional(),
    tags: z.array(z.string()).optional(),
});

const updateSchema = createSchema.partial();

export const listProducts = asyncHandler(async (req, res) => {
    const result = await productService.listProducts({
        limit: Number(req.query.limit ?? 50),
        skip: Number(req.query.skip ?? 0),
        category: req.query.category,
        search: req.query.search,
    });
    return successResponse(res, result.items, { meta: { total: result.total } });
});

export const getProduct = asyncHandler(async (req, res) => {
    const product = await productService.getProductById(req.params.id);
    return successResponse(res, product);
});

export const createProduct = asyncHandler(async (req, res) => {
    const data = createSchema.parse(req.body);
    data.createdBy = req.user.id;
    const product = await Product.create(data);
    return successResponse(res, product, { statusCode: 201, message: 'Product created' });
});

export const updateProduct = asyncHandler(async (req, res) => {
    const data = updateSchema.parse(req.body);
    const product = await Product.findByIdAndUpdate(req.params.id, data, {
        new: true,
        runValidators: true,
    });
    if (!product) throw ApiError.notFound('Product not found');
    return successResponse(res, product, { message: 'Product updated' });
});

export const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) throw ApiError.notFound('Product not found');
    return successResponse(res, { deleted: true, id: product._id }, { message: 'Product deleted' });
});

export const getLowStock = asyncHandler(async (req, res) => {
    const threshold = Number(req.query.threshold ?? 5);
    const items = await productService.getLowStockProducts(threshold);
    return successResponse(res, items, { meta: { threshold, count: items.length } });
});