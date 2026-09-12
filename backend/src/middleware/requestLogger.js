// src/middleware/requestLogger.js
import { logger } from '../utils/logger.js';

export function requestLogger(req, res, next) {
    const start = process.hrtime.bigint();

    res.on('finish', () => {
        const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
        const line = `${req.method} ${req.originalUrl} → ${res.statusCode} (${durationMs.toFixed(1)}ms)`;

        if (res.statusCode >= 500) logger.error(line);
        else if (res.statusCode >= 400) logger.warn(line);
        else logger.http(line);
    });

    next();
}