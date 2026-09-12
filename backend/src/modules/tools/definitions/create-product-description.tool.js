// src/modules/tools/definitions/create-product-description.tool.js
import { z } from 'zod';
import { Product } from '../../products/product.model.js';
import { registerTool } from '../tools.registry.js';
import { chatCompletion } from '../../../services/llm.service.js';
import { ApiError } from '../../../utils/ApiError.js';

const schema = z.object({
    productId: z.string().min(1).optional(),
    productName: z.string().trim().min(1).optional(),
    tone: z
        .enum(['professional', 'friendly', 'luxury', 'technical', 'playful'])
        .default('professional'),
    language: z.enum(['fa', 'en']).default('fa'),
    maxLength: z.number().int().min(50).max(1000).default(300),
});

const TONE_PROMPTS = {
    professional: 'حرفه‌ای، رسمی و قابل اعتماد',
    friendly: 'دوستانه، صمیمی و گرم',
    luxury: 'لوکس، پرزرق و برق و لوکس‌پسند',
    technical: 'فنی، دقیق و مختص متخصصین',
    playful: 'شاد، سرگرم‌کننده و جوان‌پسند',
};

registerTool({
    name: 'create_product_description',
    description:
        'Generate an SEO-friendly marketing description for a product. Use this when the user asks to write, generate, or improve a product description. Provide either productId (to pull data from DB) or productName + optional details.',
    jsonSchema: {
        type: 'object',
        properties: {
            productId: {
                type: 'string',
                description: 'Product ID from the catalog. If provided, the tool pulls name/category/price automatically.',
            },
            productName: {
                type: 'string',
                description: 'Product name. Required if productId is not provided.',
            },
            tone: {
                type: 'string',
                enum: ['professional', 'friendly', 'luxury', 'technical', 'playful'],
                description: 'Tone of the description. Default "professional".',
            },
            language: {
                type: 'string',
                enum: ['fa', 'en'],
                description: 'Output language. Default "fa" (Persian).',
            },
            maxLength: {
                type: 'integer',
                description: 'Maximum character length. Default 300.',
                minimum: 50,
                maximum: 1000,
            },
        },
        required: [],
    },
    schema,
    allowedRoles: ['user', 'admin'],
    timeoutMs: 30_000,
    async execute(args) {
        let productData = null;

        if (args.productId) {
            productData = await Product.findById(args.productId).lean();
            if (!productData) {
                throw ApiError.notFound(`Product not found: ${args.productId}`);
            }
        } else if (!args.productName) {
            throw ApiError.badRequest(
                'Either productId or productName must be provided'
            );
        }

        const productInfo = productData
            ? {
                name: productData.name,
                category: productData.category,
                price: productData.price,
                tags: productData.tags,
                currentDescription: productData.description,
            }
            : { name: args.productName };

        const toneFa = TONE_PROMPTS[args.tone] ?? TONE_PROMPTS.professional;

        const systemPrompt =
            args.language === 'fa'
                ? `تو یه کوپی‌رایتر حرفه‌ای فروشگاهی هستی. توضیحات محصولی می‌نویسی که سئو شده، جذاب و متقاعدکننده باشه.`
                : `You are a professional e-commerce copywriter. You write SEO-optimized, engaging, and persuasive product descriptions.`;

        const userPrompt =
            args.language === 'fa'
                ? `برای محصول زیر یک توضیح تبلیغاتی بنویس.

**اطلاعات محصول:**
${JSON.stringify(productInfo, null, 2)}

**لحن:** ${toneFa}
**حداکثر طول:** ${args.maxLength} کاراکتر
**نکات مهم:**
- عنوان جذاب داشته باشه
- ۳-۵ ویژگی کلیدی رو بولت کن
- کلمات کلیدی سئو رو طبیعی جا بده
- یه CTA (دعوت به اقدام) آخرش بذار
- فقط متن نهایی رو برگردون، بدون توضیح اضافه`
                : `Write a product description for the following product.

**Product Info:**
${JSON.stringify(productInfo, null, 2)}

**Tone:** ${args.tone}
**Max length:** ${args.maxLength} chars
**Requirements:**
- Catchy headline
- 3-5 key features as bullets
- Naturally integrate SEO keywords
- End with a CTA
- Return ONLY the final text, no extra explanation`;

        const { content, usage } = await chatCompletion({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            overrides: {
                temperature: 0.8,
                maxTokens: 1200,
            },
        });

        const generated = (content ?? '').trim();

        if (!generated) {
            throw ApiError.internal(
                'LLM returned an empty description. Please try again.'
            );
        }

        return {
            productId: productData?._id?.toString() ?? null,
            productName: productInfo.name,
            tone: args.tone,
            language: args.language,
            description: generated,
            generatedAt: new Date().toISOString(),
            usage,
        };
    },
});