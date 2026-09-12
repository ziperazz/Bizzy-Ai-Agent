// src/app.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.js';
import { swaggerSpec } from './config/swagger.js';
import { requestLogger } from './middleware/requestLogger.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import routes from './routes/index.js';

export function createApp() {
    const app = express();

    app.set('trust proxy', 1);
    app.disable('x-powered-by');
    app.use(helmet());

    app.use(
        cors({
            origin: [env.FRONTEND_URL],
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        })
    );

    // general rate limit
    app.use(
        rateLimiter({
            windowMs: 60_000,
            max: 200,
            message: 'Too many requests from this IP.',
        })
    );

    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ extended: true, limit: '1mb' }));

    // compression با نادیده گرفتن SSE
    app.use(
        compression({
            filter: (req, res) => {
                if (req.headers.accept === 'text/event-stream') return false;
                if (req.path.endsWith('/stream')) return false;
                return compression.filter(req, res);
            },
        })
    );

    app.use(requestLogger);

    // Swagger docs (فقط در dev)
    if (env.NODE_ENV !== 'production') {
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    }

    // auth endpoints rate limit
    app.use(
        '/api/auth',
        rateLimiter({
            windowMs: 15 * 60_000,
            max: 20,
            message: 'Too many auth attempts. Try again in 15 minutes.',
        })
    );

    // chat endpoints rate limit
    app.use(
        '/api/chat',
        rateLimiter({
            windowMs: 60_000,
            max: 30,
            message: 'Too many chat requests. Slow down.',
        })
    );

    app.use('/api', routes);

    app.use(notFound);
    app.use(errorHandler);

    return app;
}