// src/modules/chat/message.model.js
import mongoose from 'mongoose';
import { MESSAGE_ROLES } from '../../config/constants.js';

const toolCallSchema = new mongoose.Schema(
    {
        id: String,
        name: String,
        args: mongoose.Schema.Types.Mixed,
        ok: Boolean,
        result: mongoose.Schema.Types.Mixed,
        error: String,
    },
    { _id: false }
);

const messageSchema = new mongoose.Schema(
    {
        conversation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Conversation',
            required: true,
            index: true,
        },
        role: {
            type: String,
            enum: Object.values(MESSAGE_ROLES),
            required: true,
        },
        content: {
            type: String,
            default: '',
        },
        toolCalls: {
            type: [toolCallSchema],
            default: [],
        },
        // فقط برای role = 'tool'
        toolCallId: {
            type: String,
            default: null,
        },
        toolName: {
            type: String,
            default: null,
        },
        usage: {
            promptTokens: { type: Number, default: 0 },
            completionTokens: { type: Number, default: 0 },
            totalTokens: { type: Number, default: 0 },
        },
        meta: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: (_doc, ret) => {
                delete ret.__v;
                return ret;
            },
        },
    }
);

messageSchema.index({ conversation: 1, createdAt: 1 });

export const Message =
    mongoose.models.Message || mongoose.model('Message', messageSchema);