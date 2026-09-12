// src/modules/chat/chat.service.js
import { Conversation } from './conversation.model.js';
import { Message } from './message.model.js';
import { runAgent } from '../../services/agent.service.js';
import { ApiError } from '../../utils/ApiError.js';
import { MESSAGE_ROLES, CONVERSATION_STATUS } from '../../config/constants.js';

const HISTORY_LIMIT = 20;

/**
 * یک مکالمه جدید می‌سازد.
 */
export async function createConversation({ userId, title }) {
    return Conversation.create({
        user: userId,
        title: title ?? 'New conversation',
        status: CONVERSATION_STATUS.ACTIVE,
    });
}

/**
 * مکالمه با بررسی مالکیت.
 */
export async function getConversationOrFail(conversationId, userId, role) {
    const conv = await Conversation.findById(conversationId);
    if (!conv) throw ApiError.notFound('Conversation not found');

    const isOwner = String(conv.user) === String(userId);
    if (!isOwner && role !== 'admin') {
        throw ApiError.forbidden('You do not have access to this conversation');
    }
    return conv;
}

/**
 * لیست مکالمات کاربر.
 */
export async function listConversations(userId, { limit = 20, skip = 0 } = {}) {
    const [items, total] = await Promise.all([
        Conversation.find({ user: userId, status: CONVERSATION_STATUS.ACTIVE })
            .sort({ lastMessageAt: -1 })
            .skip(skip)
            .limit(Math.min(limit, 50))
            .lean({ virtuals: true }),
        Conversation.countDocuments({ user: userId, status: CONVERSATION_STATUS.ACTIVE }),
    ]);
    return { items, total };
}

/**
 * پیام‌های یک مکالمه.
 */
export async function getMessages(conversationId, { limit = 100, skip = 0 } = {}) {
    return Message.find({ conversation: conversationId })
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(Math.min(limit, 200))
        .lean({ virtuals: true });
}

/**
 * اجرای Agent روی پیام کاربر و ذخیره همه چیز.
 *
 * @param {object} params
 * @param {string} params.conversationId
 * @param {string} params.userId
 * @param {string} params.role
 * @param {string} params.userMessage
 * @param {(event: object) => void} [params.onStep]
 */
export async function sendMessage({
    conversationId,
    userId,
    role,
    userMessage,
    onStep,
}) {
    const conversation = await getConversationOrFail(conversationId, userId, role);

    // 1. ذخیره پیام کاربر
    const userMsg = await Message.create({
        conversation: conversation._id,
        role: MESSAGE_ROLES.USER,
        content: userMessage,
    });

    // 2. ساخت history برای LLM
    const recent = await Message.find({
        conversation: conversation._id,
        role: { $in: [MESSAGE_ROLES.USER, MESSAGE_ROLES.ASSISTANT] },
    })
        .sort({ createdAt: -1 })
        .limit(HISTORY_LIMIT)
        .lean();

    const history = recent
        .reverse()
        .slice(0, -1) // حذف پیام فعلی که همین الان ذخیره شد
        .map((m) => ({ role: m.role, content: m.content }));

    // 3. اجرای Agent
    // گرفتن تنظیمات کاربر
    const { getUserSettings } = await import('../settings/settings.service.js');
    const userSettings = await getUserSettings(userId);

    const { reply, steps, usage } = await runAgent({
        history,
        userMessage,
        context: {
            userId: String(userId),
            role,
            conversationId: String(conversation._id),
            llmModel: userSettings.llm.model,
            llmTemperature: userSettings.llm.temperature,
            llmMaxTokens: userSettings.llm.maxTokens,
        },
        onStep,
    });

    // 4. ذخیره پاسخ assistant
    const assistantMsg = await Message.create({
        conversation: conversation._id,
        role: MESSAGE_ROLES.ASSISTANT,
        content: reply,
        toolCalls: steps
            .filter((s) => s.type === 'tool_call')
            .map((s) => ({
                name: s.tool,
                args: s.args,
                ok: s.ok,
                result: s.result,
                error: s.error,
            })),
        usage: {
            promptTokens: usage.prompt_tokens ?? 0,
            completionTokens: usage.completion_tokens ?? 0,
            totalTokens: usage.total_tokens ?? 0,
        },
    });

    // 5. بروزرسانی مکالمه
    conversation.lastMessageAt = new Date();
    conversation.messageCount = (conversation.messageCount ?? 0) + 2;
    if (conversation.messageCount === 2 && conversation.title === 'New conversation') {
        conversation.title = userMessage.slice(0, 60);
    }
    await conversation.save();

    return {
        conversationId: conversation._id,
        userMessage: userMsg,
        assistantMessage: assistantMsg,
        steps,
        usage,
    };
}