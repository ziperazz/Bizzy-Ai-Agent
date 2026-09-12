// src/middleware/errorHandler.js
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import { errorResponse } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';
import { HTTP_STATUS } from '../config/constants.js';

/**
 * تبدیل خطاهای شناخته‌شده به ApiError.
 */
function normalizeError(err) {
    if (err instanceof ApiError) return err;

    if (err instanceof ZodError) {
        return new ApiError(HTTP_STATUS.UNPROCESSABLE, 'Validation failed', {
            code: 'VALIDATION_ERROR',
            details: err.issues.map((i) => ({
                path: i.path.join('.'),
                message: i.message,
            })),
        });
    }

    if (err instanceof mongoose.Error.ValidationError) {
        return new ApiError(HTTP_STATUS.UNPROCESSABLE, 'Database validation failed', {
            code: 'DB_VALIDATION_ERROR',
            details: Object.values(err.errors).map((e) => ({
                path: e.path,
                message: e.message,
            })),
        });
    }

    if (err instanceof mongoose.Error.CastError) {
        return new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid identifier format', {
            code: 'INVALID_ID',
            details: { path: err.path, value: err.value },
        });
    }

    if (err.code === 11000) {
        return new ApiError(HTTP_STATUS.CONFLICT, 'Duplicate key', {
            code: 'DUPLICATE_KEY',
            details: err.keyValue,
        });
    }

    if (err.name === 'JsonWebTokenError') {
        return new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid token', {
            code: 'INVALID_TOKEN',
        });
    }

    if (err.name === 'TokenExpiredError') {
        return new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Token expired', {
            code: 'TOKEN_EXPIRED',
        });
    }

    return new ApiError(
        err.statusCode ?? HTTP_STATUS.INTERNAL,
        err.message ?? 'Internal server error',
        { isOperational: false }
    );
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
    const apiErr = normalizeError(err);

    if (apiErr.statusCode >= 500) {
        logger.error(
            `${req.method} ${req.originalUrl} → ${apiErr.statusCode} ${apiErr.message}`,
            { stack: err.stack }
        );
    } else {
        logger.warn(
            `${req.method} ${req.originalUrl} → ${apiErr.statusCode} ${apiErr.message}`
        );
    }

    const body = {
        statusCode: apiErr.statusCode,
        message: apiErr.message,
        code: apiErr.code,
        details: apiErr.details,
    };

    if (env.NODE_ENV === 'development' && apiErr.statusCode >= 500) {
        body.stack = err.stack;
    }

    return errorResponse(res, body);
}