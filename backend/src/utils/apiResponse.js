// src/utils/apiResponse.js

/**
 * پاسخ موفق استاندارد.
 */
export function successResponse(res, data = null, options = {}) {
    const { statusCode = 200, message = 'OK', meta = null } = options;
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        ...(meta ? { meta } : {}),
    });
}

/**
 * پاسخ خطا — فقط در errorHandler استفاده می‌شود.
 */
export function errorResponse(res, options) {
    const {
        statusCode = 500,
        message = 'Internal server error',
        code = 'ERROR',
        details = null,
    } = options;

    return res.status(statusCode).json({
        success: false,
        error: {
            code,
            message,
            ...(details ? { details } : {}),
        },
    });
}