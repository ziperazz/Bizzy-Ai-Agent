// src/utils/ApiError.js
import { HTTP_STATUS } from '../config/constants.js';

export class ApiError extends Error {
    /**
     * @param {number} statusCode - HTTP status code
     * @param {string} message - پیام برای کاربر
     * @param {object} [options]
     * @param {string} [options.code] - کد خطای داخلی (مثل AUTH_INVALID)
     * @param {any} [options.details] - جزئیات اضافی
     * @param {boolean} [options.isOperational] - آیا خطای قابل پیش‌بینی است
     */
    constructor(statusCode, message, options = {}) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.code = options.code ?? 'ERROR';
        this.details = options.details ?? null;
        this.isOperational = options.isOperational ?? true;

        Error.captureStackTrace(this, this.constructor);
    }

    static badRequest(message, details) {
        return new ApiError(HTTP_STATUS.BAD_REQUEST, message, {
            code: 'BAD_REQUEST',
            details,
        });
    }

    static unauthorized(message = 'Unauthorized') {
        return new ApiError(HTTP_STATUS.UNAUTHORIZED, message, {
            code: 'UNAUTHORIZED',
        });
    }

    static forbidden(message = 'Forbidden') {
        return new ApiError(HTTP_STATUS.FORBIDDEN, message, {
            code: 'FORBIDDEN',
        });
    }

    static notFound(message = 'Resource not found') {
        return new ApiError(HTTP_STATUS.NOT_FOUND, message, {
            code: 'NOT_FOUND',
        });
    }

    static conflict(message, details) {
        return new ApiError(HTTP_STATUS.CONFLICT, message, {
            code: 'CONFLICT',
            details,
        });
    }

    static internal(message = 'Internal server error') {
        return new ApiError(HTTP_STATUS.INTERNAL, message, {
            code: 'INTERNAL_ERROR',
            isOperational: false,
        });
    }
}