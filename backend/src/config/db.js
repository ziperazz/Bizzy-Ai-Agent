// src/config/db.js
import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

mongoose.set('strictQuery', true);

/**
 * اتصال به MongoDB با retry logic و مدیریت رویدادها.
 */
export async function connectDatabase() {
    try {
        const conn = await mongoose.connect(env.MONGO_URI, {
            serverSelectionTimeoutMS: 10_000,
            socketTimeoutMS: 45_000,
            maxPoolSize: 20,
            minPoolSize: 2,
        });

        logger.info(
            `✅ MongoDB connected: ${conn.connection.host}/${conn.connection.name}`
        );
    } catch (err) {
        logger.error(`❌ MongoDB connection failed: ${err.message}`);
        process.exit(1);
    }

    mongoose.connection.on('disconnected', () => {
        logger.warn('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
        logger.info('🔁 MongoDB reconnected');
    });

    mongoose.connection.on('error', (err) => {
        logger.error(`MongoDB runtime error: ${err.message}`);
    });
}

/**
 * بستن تمیز اتصال — برای graceful shutdown.
 */
export async function disconnectDatabase() {
    await mongoose.connection.close();
    logger.info('🛑 MongoDB connection closed');
}