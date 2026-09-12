// src/services/tool-runner.service.js
import { toolsRegistry } from '../modules/tools/tools.registry.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

const DEFAULT_TOOL_TIMEOUT_MS = 15_000;

/**
 * اجرای یک tool بر اساس نام.
 *
 * @param {object} params
 * @param {string} params.name - نام tool
 * @param {object} params.args - آرگومان‌ها
 * @param {object} params.context - { userId, role, conversationId }
 * @returns {Promise<{ ok: boolean, data?: any, error?: string }>}
 */
export async function runTool({ name, args, context }) {
    const tool = toolsRegistry.get(name);

    if (!tool) {
        logger.warn(`Tool not found: ${name}`);
        return { ok: false, error: `Tool "${name}" is not registered` };
    }

    // Permission check
    try {
        tool.assertAccess?.(context);
    } catch (err) {
        logger.warn(`Tool "${name}" access denied for user=${context?.userId}`);
        return {
            ok: false,
            error: err.message ?? 'Access denied for this tool',
        };
    }

    // Validate args
    let parsedArgs;
    try {
        parsedArgs = tool.schema.parse(args ?? {});
    } catch (err) {
        logger.warn(`Tool "${name}" invalid args: ${err.message}`);
        return {
            ok: false,
            error: `Invalid arguments for "${name}": ${err.message}`,
        };
    }

    // Execute with timeout
    try {
        const data = await Promise.race([
            tool.execute(parsedArgs, context),
            new Promise((_, reject) =>
                setTimeout(
                    () =>
                        reject(
                            new Error(
                                `Tool "${name}" timed out after ${tool.timeoutMs ?? DEFAULT_TOOL_TIMEOUT_MS}ms`
                            )
                        ),
                    tool.timeoutMs ?? DEFAULT_TOOL_TIMEOUT_MS
                )
            ),
        ]);

        return { ok: true, data };
    } catch (err) {
        logger.error(`Tool "${name}" execution failed: ${err.message}`);
        return { ok: false, error: err.message ?? 'Tool execution failed' };
    }
}

/**
 * گرفتن همه tool definitions برای فرستادن به LLM.
 * @param {object} context - { role } برای فیلتر دسترسی
 */
export function getToolDefinitionsForLLM(context) {
    const all = toolsRegistry.getAll();
    return all
        .filter((t) => {
            if (!t.allowedRoles) return true;
            return t.allowedRoles.includes(context?.role);
        })
        .map((t) => ({
            type: 'function',
            function: {
                name: t.name,
                description: t.description,
                parameters: t.jsonSchema,
            },
        }));
}