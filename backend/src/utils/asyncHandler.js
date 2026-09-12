// src/utils/asyncHandler.js

/**
 * هر async route handler را wrap می‌کند و خطاها را به Express error middleware می‌دهد.
 * @param {(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => Promise<any>} fn
 */
export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};