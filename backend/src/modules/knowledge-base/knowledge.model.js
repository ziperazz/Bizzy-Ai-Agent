// src/modules/knowledge-base/knowledge.model.js
import mongoose from 'mongoose';

const knowledgeDocSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 300,
            index: 'text',
        },
        content: {
            type: String,
            required: true,
            maxlength: 100_000,
            index: 'text',
        },
        category: {
            type: String,
            trim: true,
            index: true,
            default: 'general',
        },
        tags: {
            type: [String],
            default: [],
            index: true,
        },
        source: {
            type: String,
            enum: ['manual', 'pdf', 'url', 'faq'],
            default: 'manual',
        },
        // برای فاز RAG:
        embedding: {
            type: [Number],
            default: undefined,
            select: false,
        },
        isPublished: {
            type: Boolean,
            default: true,
            index: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: (_doc, ret) => {
                delete ret.__v;
                delete ret.embedding;
                return ret;
            },
        },
    }
);

// Full-text search index
knowledgeDocSchema.index({
    title: 'text',
    content: 'text',
    tags: 'text',
});

export const KnowledgeDoc =
    mongoose.models.KnowledgeDoc ||
    mongoose.model('KnowledgeDoc', knowledgeDocSchema);