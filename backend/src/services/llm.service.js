// src/services/llm.service.js
import axios from 'axios';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { ApiError } from '../utils/ApiError.js';

const client = axios.create({
    baseURL: env.OPENROUTER_BASE_URL,
    timeout: 60_000,
    headers: {
        Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': env.FRONTEND_URL,
        'X-Title': 'AI Business Assistant',
    },
});

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 800;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * یک پیام به LLM می‌فرستد.
 *
 * @param {object} params
 * @param {Array} params.messages - آرایه پیام‌ها (role/content)
 * @param {Array} [params.tools] - آرایه tool definitions (اختیاری)
 * @param {string} [params.toolChoice] - 'auto' | 'none' | {type:'function', function:{name}}
 * @param {object} [params.overrides] - بازنویسی تنظیمات پیش‌فرض مدل
 * @returns {Promise<{content: string|null, toolCalls: Array, raw: object, usage: object}>}
 */
export async function chatCompletion({
    messages,
    tools,
    toolChoice = 'auto',
    overrides = {},
}) {
    if (!Array.isArray(messages) || messages.length === 0) {
        throw ApiError.badRequest('`messages` must be a non-empty array');
    }

    const body = {
        model: overrides.model ?? env.LLM_MODEL,
        messages,
        temperature: overrides.temperature ?? env.LLM_TEMPERATURE,
        max_tokens: overrides.maxTokens ?? env.LLM_MAX_TOKENS,
    };

    if (tools?.length) {
        body.tools = tools;
        body.tool_choice = toolChoice;
    }

    let attempt = 0;
    let lastErr;

    while (attempt <= MAX_RETRIES) {
        try {
            const { data } = await client.post('/chat/completions', body);
            const choice = data?.choices?.[0];
            const msg = choice?.message ?? {};

            // مدل‌های reasoning-based ممکنه content رو توی reasoning بذارن
            const content = msg.content ?? null;
            const reasoning = msg.reasoning ?? null;

            // اگه content خالیه ولی reasoning داره، از reasoning استفاده کن
            const effectiveContent = content || reasoning || null;

            return {
                content: effectiveContent,
                rawContent: content,
                reasoning,
                toolCalls: msg.tool_calls ?? [],
                finishReason: choice?.finish_reason ?? null,
                usage: data?.usage ?? {},
                raw: data,
            };
        } catch (err) {
            lastErr = err;
            const status = err.response?.status;
            const retriable = !status || status >= 500 || status === 429;

            logger.warn(
                `LLM request failed (attempt ${attempt + 1}/${MAX_RETRIES + 1}): ${err.message}`
            );

            if (!retriable || attempt === MAX_RETRIES) break;

            await sleep(RETRY_DELAY_MS * (attempt + 1));
            attempt += 1;
        }
    }

    const status = lastErr?.response?.status;
    const detail =
        lastErr?.response?.data?.error?.message ?? lastErr?.message ?? 'Unknown';

    logger.error(`LLM final failure: ${detail}`);

    if (status === 401) {
        throw ApiError.internal('LLM provider authentication failed');
    }
    if (status === 429) {
        throw new ApiError(429, 'LLM rate limit exceeded, please retry later', {
            code: 'LLM_RATE_LIMIT',
        });
    }

    throw new ApiError(502, 'LLM provider error', {
        code: 'LLM_PROVIDER_ERROR',
        details: detail,
    });
}