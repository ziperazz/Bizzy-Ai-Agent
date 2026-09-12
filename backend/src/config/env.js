// src/config/env.js
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

/**
 * Environment variable schema.
 * اگر متغیر حیاتی نباشد، پروسه با پیام واضح متوقف می‌شود.
 */
const envSchema = z.object({
    NODE_ENV: z
        .enum(['development', 'production', 'test'])
        .default('development'),

    PORT: z.coerce.number().int().positive().default(5000),

    MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
    MONGO_URI_TEST: z.string().optional(),

    JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 chars'),
    JWT_REFRESH_SECRET: z
        .string()
        .min(16, 'JWT_REFRESH_SECRET must be at least 16 chars'),
    JWT_EXPIRES_IN: z.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

    OPENROUTER_API_KEY: z.string().min(1, 'OPENROUTER_API_KEY is required'),
    OPENROUTER_BASE_URL: z
        .string()
        .url()
        .default('https://openrouter.ai/api/v1'),
    LLM_MODEL: z.string().default('openai/gpt-4o-mini'),
    LLM_TEMPERATURE: z.coerce.number().min(0).max(2).default(0.7),
    LLM_MAX_TOKENS: z.coerce.number().int().positive().default(2048),

    FRONTEND_URL: z.string().url().default('http://localhost:3000'),
    MAX_AGENT_STEPS: z.coerce.number().int().min(1).max(20).default(5),
    AGENT_TIMEOUT_MS: z.coerce.number().int().positive().default(60000),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    const issues = parsed.error.issues
        .map((i) => `  • ${i.path.join('.')}: ${i.message}`)
        .join('\n');
    // eslint-disable-next-line no-console
    console.error(`\n❌ Invalid environment variables:\n${issues}\n`);
    process.exit(1);
}

export const env = Object.freeze(parsed.data);