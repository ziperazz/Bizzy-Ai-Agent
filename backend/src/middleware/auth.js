// src/middleware/auth.js
import { ApiError } from '../utils/ApiError.js';
import { verifyAccessToken } from '../modules/auth/auth.service.js';
import { User } from '../modules/auth/user.model.js';

/**
 * احراز هویت با JWT از هدر Authorization: Bearer <token>
 */
export async function requireAuth(req, _res, next) {
    try {
        const header = req.headers.authorization ?? '';
        const [scheme, token] = header.split(' ');

        if (scheme !== 'Bearer' || !token) {
            throw ApiError.unauthorized('Missing or malformed Authorization header');
        }

        const payload = verifyAccessToken(token);
        const user = await User.findById(payload.sub);

        if (!user || !user.isActive) {
            throw ApiError.unauthorized('User not found or inactive');
        }

        req.user = {
            id: String(user._id),
            email: user.email,
            name: user.name,
            role: user.role,
        };

        next();
    } catch (err) {
        next(err);
    }
}

/**
 * محدود کردن route به نقش‌های مشخص.
 */
export function requireRole(...roles) {
    return (req, _res, next) => {
        if (!req.user) return next(ApiError.unauthorized());
        if (!roles.includes(req.user.role)) {
            return next(ApiError.forbidden('Insufficient permissions'));
        }
        next();
    };
}