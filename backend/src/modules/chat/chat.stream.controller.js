// src/modules/chat/chat.stream.controller.js
import { z } from 'zod';
import { createSSEStream } from '../../utils/sse.js';
import { logger } from '../../utils/logger.js';
import * as chatService from './chat.service.js';

const sendMessageSchema = z.object({
    message: z.string().trim().min(1, 'Message cannot be empty').max(4000),
});

/**
 * POST /api/chat/:id/messages/stream
 * پاسخ Agent رو به صورت SSE stream برمیگردونه.
 */
export async function streamMessage(req, res) {
    const { id: conversationId } = req.params;

    // اعتبارسنجی بدنه
    let parsed;
    try {
        parsed = sendMessageSchema.parse(req.body);
    } catch (err) {
        return res.status(422).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid message',
                details: err.issues?.map((i) => ({
                    path: i.path.join('.'),
                    message: i.message,
                })),
            },
        });
    }

    // بررسی مالکیت مکالمه قبل از باز کردن stream
    try {
        await chatService.getConversationOrFail(
            conversationId,
            req.user.id,
            req.user.role
        );
    } catch (err) {
        return res.status(err.statusCode ?? 500).json({
            success: false,
            error: {
                code: err.code ?? 'ERROR',
                message: err.message,
            },
        });
    }

    const sse = createSSEStream(res);

    sse.send('connected', {
        conversationId,
        timestamp: new Date().toISOString(),
    });

    try {
        const result = await chatService.sendMessage({
            conversationId,
            userId: req.user.id,
            role: req.user.role,
            userMessage: parsed.message,
            onStep: (event) => {
                // forward هر step به کلاینت
                sse.send('step', event);
            },
        });

        sse.send('done', {
            conversationId: result.conversationId,
            assistantMessage: {
                id: result.assistantMessage._id,
                content: result.assistantMessage.content,
                createdAt: result.assistantMessage.createdAt,
            },
            usage: result.usage,
            stepsCount: result.steps.length,
        });
    } catch (err) {
        logger.error(`Stream error: ${err.message}`);

        sse.send('error', {
            code: err.code ?? 'STREAM_ERROR',
            message: err.message ?? 'Stream failed',
        });
    } finally {
        sse.close();
    }
}