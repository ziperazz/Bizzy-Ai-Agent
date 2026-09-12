// src/middleware/rateLimiter.js
import { ApiError } from '../utils/ApiError.js';

/**
 * Rate limiter ساده in-memory.
 * برای production از redis استفاده کن (مثل rate-limiter-flexible).
 */
export function rateLimiter({
    windowMs = 60_000,
    max = 60,
    keyGenerator = (req) => req.ip,
    message = 'Too many requests, please try again later.',
} = {}) {
    const hits = new Map();

    // پاکسازی دوره‌ای
    setInterval(() => {
        const now = Date.now();
        for (const [key, data] of hits.entries()) {
            if (data.resetAt < now) hits.delete(key);
        }
    }, windowMs).unref();

    return (req, _res, next) => {
        const key = keyGenerator(req);
        const now = Date.now();
        const entry = hits.get(key);

        if (!entry || entry.resetAt < now) {
            hits.set(key, { count: 1, resetAt: now + windowMs });
            return next();
        }

        entry.count += 1;

        if (entry.count > max) {
            const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
            return next(
                new ApiError(429, message, {
                    code: 'RATE_LIMIT_EXCEEDED',
                    details: { retryAfter },
                })
            );
        }

        next();
    };
}