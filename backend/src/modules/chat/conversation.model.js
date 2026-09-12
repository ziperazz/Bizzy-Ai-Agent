// src/modules/chat/conversation.model.js
import mongoose from 'mongoose';
import { CONVERSATION_STATUS } from '../../config/constants.js';

const conversationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        title: {
            type: String,
            trim: true,
            maxlength: 200,
            default: 'New conversation',
        },
        status: {
            type: String,
            enum: Object.values(CONVERSATION_STATUS),
            default: CONVERSATION_STATUS.ACTIVE,
            index: true,
        },
        lastMessageAt: {
            type: Date,
            default: Date.now,
            index: true,
        },
        messageCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        metadata: {
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

conversationSchema.index({ user: 1, lastMessageAt: -1 });

export const Conversation =
    mongoose.models.Conversation ||
    mongoose.model('Conversation', conversationSchema);