// src/modules/settings/settings.model.js
import mongoose from 'mongoose';

/**
 * تنظیمات هر کاربر — میتونه شامل مدل LLM و سایر preferences باشه
 */
const userSettingsSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
            index: true,
        },
        llm: {
            model: {
                type: String,
                default: 'inclusionai/ling-3.0-flash-vl:free',
            },
            temperature: {
                type: Number,
                min: 0,
                max: 2,
                default: 0.7,
            },
            maxTokens: {
                type: Number,
                min: 100,
                max: 32000,
                default: 2048,
            },
        },
        preferences: {
            language: {
                type: String,
                enum: ['fa', 'en'],
                default: 'fa',
            },
            theme: {
                type: String,
                enum: ['light', 'dark', 'system'],
                default: 'system',
            },
        },
    },
    { timestamps: true }
);

export const UserSettings =
    mongoose.models.UserSettings ||
    mongoose.model('UserSettings', userSettingsSchema);