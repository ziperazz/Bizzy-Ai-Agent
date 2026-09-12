// tests/setup.js
import { jest } from '@jest/globals';

// Environment برای test
process.env.NODE_ENV = 'test';
process.env.PORT = '0';
process.env.MONGO_URI =
    process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/ai-business-assistant-test';
process.env.JWT_SECRET = 'test_jwt_secret_key_long_enough_for_validation';
process.env.JWT_REFRESH_SECRET = 'test_jwt_refresh_secret_long_enough_here';
process.env.JWT_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.OPENROUTER_API_KEY = 'test_key';
process.env.OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
process.env.LLM_MODEL = 'openai/gpt-4o-mini';
process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.MAX_AGENT_STEPS = '5';
process.env.AGENT_TIMEOUT_MS = '60000';

// mock برای LLM تا تست‌ها واقعی LLM صدا نزنن
jest.unstable_mockModule('../src/services/llm.service.js', () => ({
    chatCompletion: jest.fn(async () => ({
        content: 'Mock LLM response',
        toolCalls: [],
        finishReason: 'stop',
        usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
    })),
}));