// src/services/agent.service.js
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { chatCompletion } from './llm.service.js';
import { runTool, getToolDefinitionsForLLM } from './tool-runner.service.js';
import { MESSAGE_ROLES } from '../config/constants.js';

/**
 * پرامپت سیستمی Agent — قوانین اصلی رفتار.
 */
const SYSTEM_PROMPT = `You are "Bizzy", an AI Business Assistant for an e-commerce company.

You help users with:
- Sales reports and analytics
- Product catalog queries
- Inventory and low-stock detection
- Task creation for follow-ups
- Generating SEO-friendly product descriptions
- Answering questions from the company knowledge base

# RULES
1. You have access to tools. USE THEM whenever the user asks for data — never invent numbers or product names.
2. If multiple tools are needed, call them in sequence, one step at a time.
3. If a tool returns an error, explain it to the user clearly and, if possible, try an alternative approach.
4. Always answer in the same language the user wrote in.
5. Be concise. Use markdown formatting (lists, bold, tables) when helpful.
6. If the user's request is ambiguous, ask ONE clarifying question — don't guess.
7. Never expose internal IDs, secrets, or raw tool arguments unless the user explicitly asks.
8. For destructive or financial actions (deleting, sending money, changing prices), ask for confirmation first.

# STYLE
- Professional, friendly, and efficient.
- Show only the final answer — do not narrate every step unless asked.
`;

/**
 * اجرای Agent Loop.
 *
 * @param {object} params
 * @param {Array<{role: string, content: string}>} params.history - پیام‌های قبلی (بدون system)
 * @param {string} params.userMessage - پیام جدید کاربر
 * @param {object} params.context - { userId, role, conversationId }
 * @param {(event: object) => void} [params.onStep] - callback برای SSE (اختیاری)
 * @returns {Promise<{ reply: string, steps: Array, usage: object }>}
 */
export async function runAgent({
    history = [],
    userMessage,
    context,
    onStep,
}) {
    // context حالا میتونه llmModel, llmTemperature, llmMaxTokens داشته باشه
    if (!userMessage || typeof userMessage !== 'string') {
        throw new Error('userMessage is required');
    }

    const toolDefs = getToolDefinitionsForLLM(context);

    const messages = [
        { role: MESSAGE_ROLES.SYSTEM, content: SYSTEM_PROMPT },
        ...history,
        { role: MESSAGE_ROLES.USER, content: userMessage },
    ];

    const steps = [];
    const usageTotal = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

    let finalContent = null;

    for (let step = 0; step < env.MAX_AGENT_STEPS; step += 1) {
        logger.debug(`Agent step ${step + 1}/${env.MAX_AGENT_STEPS}`);

        onStep?.({ type: 'step_start', step: step + 1 });

        const { content, reasoning, toolCalls, usage, finishReason } = await chatCompletion({
            messages,
            tools: toolDefs.length ? toolDefs : undefined,
            overrides: {
                model: context?.llmModel,
                temperature: context?.llmTemperature,
                maxTokens: context?.llmMaxTokens,
            },
        });

        // accumulate usage
        for (const k of Object.keys(usageTotal)) {
            usageTotal[k] += usage?.[k] ?? 0;
        }

        if (!toolCalls.length) {
            // پاکسازی artifactهای مدل (مثل <arg_value> که بعضی مدل‌ها میذارن)
            let cleaned = (content ?? '').trim();
            cleaned = cleaned.replace(/^<arg_value>\s*/i, '').replace(/<\/arg_value>\s*$/i, '');
            finalContent = cleaned;
            steps.push({
                step: step + 1,
                type: 'final',
                content: finalContent,
                finishReason,
            });
            onStep?.({ type: 'final', step: step + 1, content: finalContent });
            break;
        }

        // Append assistant message with tool_calls
        messages.push({
            role: MESSAGE_ROLES.ASSISTANT,
            content: content ?? null,
            tool_calls: toolCalls,
        });

        // Execute each tool call
        for (const call of toolCalls) {
            const name = call.function?.name;
            let args = {};

            try {
                args = call.function?.arguments
                    ? JSON.parse(call.function.arguments)
                    : {};
            } catch (err) {
                logger.warn(`Failed to parse tool args for "${name}": ${err.message}`);
            }

            onStep?.({ type: 'tool_call', step: step + 1, tool: name, args });

            const result = await runTool({ name, args, context });

            steps.push({
                step: step + 1,
                type: 'tool_call',
                tool: name,
                args,
                ok: result.ok,
                result: result.ok ? result.data : undefined,
                error: result.ok ? undefined : result.error,
            });

            onStep?.({
                type: 'tool_result',
                step: step + 1,
                tool: name,
                ok: result.ok,
            });

            // خروجی tool رو محدود کن که context منفجر نشه
            const rawResult = result.ok
                ? { ok: true, data: result.data }
                : { ok: false, error: result.error };
            let resultStr = JSON.stringify(rawResult);
            const MAX_TOOL_RESULT_CHARS = 4000;

            if (resultStr.length > MAX_TOOL_RESULT_CHARS) {
                resultStr =
                    resultStr.slice(0, MAX_TOOL_RESULT_CHARS) + '... [truncated]';
            }

            messages.push({
                role: MESSAGE_ROLES.TOOL,
                tool_call_id: call.id,
                name,
                content: resultStr,
            });
        }
    }

    if (finalContent === null) {
        finalContent =
            'متأسفم، در پردازش درخواست شما به محدودیت تعداد مراحل رسیدم. لطفاً درخواست را ساده‌تر مطرح کنید.';
        steps.push({ type: 'limit_reached', content: finalContent });
        onStep?.({ type: 'limit_reached', content: finalContent });
    }

    // پاکسازی artifactهای بعضی مدل‌ها مثل <arg_value>...</arg_value>
    finalContent = sanitizeModelOutput(finalContent);

    return { reply: finalContent, steps, usage: usageTotal };
}

/**
 * حذف artifactهای مدل از خروجی نهایی
 */
function sanitizeModelOutput(text) {
    if (!text) return text;
    return text
        .replace(/<\/?arg_value>/gi, '')
        .replace(/<\/?tool_call>/gi, '')
        .replace(/<\/?tool_response>/gi, '')
        .replace(/^<[^>]+>\s*/gm, '')
        .replace(/<\/[^>]+>$/gm, '')
        .trim();
};
