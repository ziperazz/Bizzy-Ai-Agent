// src/modules/settings/settings.service.js
import { UserSettings } from './settings.model.js';
import { env } from '../../config/env.js';

/**
 * لیست مدل‌های معتبر OpenRouter — به صورت static
 * در production این رو از OpenRouter API یا دیتابیس می‌خونیم
 */
export const AVAILABLE_MODELS = [
    {
        id: 'inclusionai/ling-3.0-flash-vl:free',
        name: 'Ling 3.0 Flash VL',
        provider: 'InclusionAI',
        context: 262144,
        pricing: { input: 0, output: 0 },
        free: true,
        toolCalling: true,
        description: 'مدل چندمنظوره با 262K context — پیشنهاد پیش‌فرض',
    },
    {
        id: 'nex-agi/nex-n2.5-pro:free',
        name: 'Nex N2.5 Pro',
        provider: 'Nex AGI',
        context: 262144,
        pricing: { input: 0, output: 0 },
        free: true,
        toolCalling: true,
        description: 'مدل Agentic مخصوص — برای کارهای پیچیده',
    },
    {
        id: 'nex-agi/nex-n2.5-mini:free',
        name: 'Nex N2.5 Mini',
        provider: 'Nex AGI',
        context: 262144,
        pricing: { input: 0, output: 0 },
        free: true,
        toolCalling: true,
        description: 'نسخه سبک‌تر Nex برای سرعت',
    },
    {
        id: 'openai/gpt-4o-mini',
        name: 'GPT-4o Mini',
        provider: 'OpenAI',
        context: 128000,
        pricing: { input: 0.15, output: 0.6 },
        free: false,
        toolCalling: true,
        description: 'بهترین کیفیت در بین مدل‌های ارزان',
    },
];

export const DEFAULT_MODEL = env.LLM_MODEL;

export async function getUserSettings(userId) {
    let settings = await UserSettings.findOne({ user: userId });

    if (!settings) {
        settings = await UserSettings.create({
            user: userId,
            llm: {
                model: DEFAULT_MODEL,
                temperature: env.LLM_TEMPERATURE,
                maxTokens: env.LLM_MAX_TOKENS,
            },
        });
    }

    return settings;
}

export async function updateUserSettings(userId, updates) {
    const settings = await getUserSettings(userId);

    if (updates.llm) {
        if (updates.llm.model !== undefined) settings.llm.model = updates.llm.model;
        if (updates.llm.temperature !== undefined)
            settings.llm.temperature = updates.llm.temperature;
        if (updates.llm.maxTokens !== undefined)
            settings.llm.maxTokens = updates.llm.maxTokens;
    }

    if (updates.preferences) {
        if (updates.preferences.language !== undefined)
            settings.preferences.language = updates.preferences.language;
        if (updates.preferences.theme !== undefined)
            settings.preferences.theme = updates.preferences.theme;
    }

    await settings.save();
    return settings;
}

export function isModelAvailable(modelId) {
    return AVAILABLE_MODELS.some((m) => m.id === modelId);
}

export function getModelInfo(modelId) {
    return AVAILABLE_MODELS.find((m) => m.id === modelId) ?? null;
}