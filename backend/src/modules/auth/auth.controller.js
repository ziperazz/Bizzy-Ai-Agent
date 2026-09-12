// src/modules/auth/auth.controller.js
import { z } from 'zod';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { successResponse } from '../../utils/apiResponse.js';
import * as authService from './auth.service.js';

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(72),
    name: z.string().trim().max(100).optional(),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export const register = asyncHandler(async (req, res) => {
    const data = registerSchema.parse(req.body);
    const result = await authService.register(data);
    return successResponse(res, result, { statusCode: 201, message: 'Registered' });
});

export const login = asyncHandler(async (req, res) => {
    const data = loginSchema.parse(req.body);
    const result = await authService.login(data);
    return successResponse(res, result, { message: 'Logged in' });
});

export const me = asyncHandler(async (req, res) => {
    return successResponse(res, req.user);
});