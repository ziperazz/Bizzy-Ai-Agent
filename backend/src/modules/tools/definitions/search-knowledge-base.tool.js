// src/modules/tools/definitions/search-knowledge-base.tool.js
import { z } from 'zod';
import { registerTool } from '../tools.registry.js';
import { KnowledgeDoc } from '../../knowledge-base/knowledge.model.js';

const schema = z.object({
    query: z.string().trim().min(2).max(500),
    limit: z.number().int().min(1).max(10).default(3),
});

/**
 * استخراج کلمات کلیدی از query (پشتیبانی از فارسی و انگلیسی)
 */
function extractKeywords(query) {
    const stopWordsFa = new Set([
        'از', 'به', 'با', 'در', 'را', 'که', 'این', 'آن', 'های', 'ها',
        'است', 'هست', 'چی', 'چیه', 'چیست', 'برای', 'میشه', 'می‌شه',
    ]);
    const stopWordsEn = new Set([
        'the', 'a', 'an', 'is', 'are', 'was', 'were', 'of', 'to', 'in',
        'on', 'at', 'for', 'with', 'by', 'and', 'or',
    ]);

    return query
        .toLowerCase()
        .replace(/[؟?!.,،؛:()"'\-[\]{}]/g, ' ')
        .split(/\s+/)
        .map((w) => w.trim())
        .filter((w) => w.length >= 2 && !stopWordsFa.has(w) && !stopWordsEn.has(w));
}

registerTool({
    name: 'search_knowledge_base',
    description:
        'Search the company knowledge base (policies, FAQs, internal docs, product guides) for relevant information. Use this whenever the user asks about company rules, return policies, shipping, or general FAQs.',
    jsonSchema: {
        type: 'object',
        properties: {
            query: {
                type: 'string',
                description: 'The search query in natural language.',
            },
            limit: {
                type: 'integer',
                description: 'Maximum number of results to return. Default 3, max 10.',
                minimum: 1,
                maximum: 10,
            },
        },
        required: ['query'],
    },
    schema,
    allowedRoles: ['user', 'admin'],
    timeoutMs: 10_000,
    async execute(args) {
        const keywords = extractKeywords(args.query);

        if (keywords.length === 0) {
            return {
                query: args.query,
                found: 0,
                results: [],
                note: 'No meaningful keywords found in query.',
            };
        }

        const regexes = keywords.map((kw) => new RegExp(kw, 'i'));

        const results = await KnowledgeDoc.find({
            isPublished: true,
            $or: [
                { title: { $in: regexes } },
                { content: { $in: regexes } },
                { tags: { $in: regexes } },
                { category: { $in: regexes } },
            ],
        })
            .limit(args.limit)
            .select('title content category tags')
            .lean();

        if (results.length === 0) {
            return {
                query: args.query,
                keywords,
                found: 0,
                results: [],
                note: `No matching documents found. Try different keywords.`,
            };
        }

        return {
            query: args.query,
            keywords,
            found: results.length,
            results: results.map((doc) => ({
                title: doc.title,
                category: doc.category,
                content: doc.content.length > 800
                    ? doc.content.slice(0, 800) + '...'
                    : doc.content,
                tags: doc.tags,
            })),
        };
    },
});