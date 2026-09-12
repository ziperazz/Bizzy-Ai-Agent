// src/server.js
import { createApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/db.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

async function bootstrap() {
    await connectDatabase();

    const app = createApp();
    const server = app.listen(env.PORT, () => {
        logger.info(`🚀 Server running on http://localhost:${env.PORT} (${env.NODE_ENV})`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
        logger.warn(`Received ${signal}, shutting down gracefully...`);
        server.close(async () => {
            await disconnectDatabase();
            process.exit(0);
        });
        // فورس بستن بعد از 10 ثانیه
        setTimeout(() => process.exit(1), 10_000).unref();
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

    process.on('unhandledRejection', (reason) => {
        logger.error('Unhandled rejection:', reason);
    });
    process.on('uncaughtException', (err) => {
        logger.error('Uncaught exception:', err);
        shutdown('uncaughtException');
    });
}

bootstrap().catch((err) => {
    // eslint-disable-next-line no-console
    console.error('❌ Fatal bootstrap error:', err);
    process.exit(1);
});