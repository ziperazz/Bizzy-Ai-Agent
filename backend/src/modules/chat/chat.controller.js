// src/modules/chat/chat.controller.js
import { z } from 'zod';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { successResponse } from '../../utils/apiResponse.js';
import * as chatService from './chat.service.js';

const createConvSchema = z.object({
    title: z.string().trim().max(200).optional(),
});

const sendMessageSchema = z.object({
    message: z.string().trim().min(1, 'Message cannot be empty').max(4000),
});

export const createConversation = asyncHandler(async (req, res) => {
    const { title } = createConvSchema.parse(req.body ?? {});
    const conv = await chatService.createConversation({
        userId: req.user.id,
        title,
    });
    return successResponse(res, conv, { statusCode: 201, message: 'Conversation created' });
});

export const listConversations = asyncHandler(async (req, res) => {
    const limit = Number(req.query.limit ?? 20);
    const skip = Number(req.query.skip ?? 0);
    const result = await chatService.listConversations(req.user.id, { limit, skip });
    return successResponse(res, result.items, { meta: { total: result.total } });
});

export const getMessages = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await chatService.getConversationOrFail(id, req.user.id, req.user.role);
    const messages = await chatService.getMessages(id);
    return successResponse(res, messages);
});

export const sendMessage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { message } = sendMessageSchema.parse(req.body);

    const result = await chatService.sendMessage({
        conversationId: id,
        userId: req.user.id,
        role: req.user.role,
        userMessage: message,
    });

    return successResponse(res, result, { message: 'Agent replied' });
});