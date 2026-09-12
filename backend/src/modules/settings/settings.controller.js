// src/modules/settings/settings.controller.js
import { z } from 'zod';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { successResponse } from '../../utils/apiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import * as settingsService from './settings.service.js';

const updateSchema = z.object({
    llm: z
        .object({
            model: z.string().optional(),
            temperature: z.number().min(0).max(2).optional(),
            maxTokens: z.number().int().min(100).max(32000).optional(),
        })
        .optional(),
    preferences: z
        .object({
            language: z.enum(['fa', 'en']).optional(),
            theme: z.enum(['light', 'dark', 'system']).optional(),
        })
        .optional(),
});

/**
 * GET /api/settings
 */
export const getSettings = asyncHandler(async (req, res) => {
    const settings = await settingsService.getUserSettings(req.user.id);
    return successResponse(res, settings);
});

/**
 * PATCH /api/settings
 */
export const updateSettings = asyncHandler(async (req, res) => {
    const updates = updateSchema.parse(req.body);

    // چک کن مدل معتبره
    if (updates.llm?.model) {
        if (!settingsService.isModelAvailable(updates.llm.model)) {
            throw ApiError.badRequest(
                `Model "${updates.llm.model}" is not available`,
                { availableModels: settingsService.AVAILABLE_MODELS.map((m) => m.id) }
            );
        }
    }

    const settings = await settingsService.updateUserSettings(
        req.user.id,
        updates
    );
    return successResponse(res, settings, { message: 'Settings updated' });
});

/**
 * GET /api/settings/models — لیست همه مدل‌های موجود
 */
export const listModels = asyncHandler(async (_req, res) => {
    return successResponse(res, {
        models: settingsService.AVAILABLE_MODELS,
        default: settingsService.DEFAULT_MODEL,
    });
});

/**
 * POST /api/settings/models/test — تست یه مدل
 */
export const testModel = asyncHandler(async (req, res) => {
    const schema = z.object({
        model: z.string().min(1),
    });

    const { model } = schema.parse(req.body);

    if (!settingsService.isModelAvailable(model)) {
        throw ApiError.badRequest(`Model "${model}" is not available`);
    }

    // تست با یک پیام ساده
    const { chatCompletion } = await import('../../services/llm.service.js');

    const startTime = Date.now();
    try {
        const result = await chatCompletion({
            messages: [{ role: 'user', content: 'Say "ok" in one word.' }],
            overrides: { model, maxTokens: 10, temperature: 0 },
        });

        return successResponse(res, {
            model,
            ok: true,
            response: result.content,
            latencyMs: Date.now() - startTime,
            usage: result.usage,
        });
    } catch (err) {
        return successResponse(res, {
            model,
            ok: false,
            error: err.message,
            latencyMs: Date.now() - startTime,
        });
    }
});