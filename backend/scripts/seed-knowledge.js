// scripts/seed-knowledge.js
import { connectDatabase, disconnectDatabase } from '../src/config/db.js';
import { logger } from '../src/utils/logger.js';
import { KnowledgeDoc } from '../src/modules/knowledge-base/knowledge.model.js';

const DOCS = [
    {
        title: 'قوانین مرجوعی محصولات',
        category: 'returns',
        tags: ['مرجوعی', 'بازگشت', 'ضمانت', 'return', 'refund'],
        content: `مشتریان می‌توانند تا ۷ روز پس از دریافت محصول، درخواست مرجوعی ثبت کنند.

شرایط مرجوعی:
- محصول باید در بسته‌بندی اصلی و بدون آسیب باشد
- مهر و برچسب‌های محصول نباید جدا شده باشند
- هزینه ارسال مرجوعی بر عهده مشتری است مگر در صورت ایراد فنی
- بازگشت وجه حداکثر تا ۴۸ ساعت پس از تأیید کارشناس انجام می‌شود

محصولات زیر قابل مرجوعی نیستند:
- محصولات بهداشتی باز شده
- محصولات سفارشی‌سازی شده
- کارت‌های هدیه و گیفت کارت`,
    },
    {
        title: 'شرایط ارسال و تحویل',
        category: 'shipping',
        tags: ['ارسال', 'پست', 'تحویل', 'shipping', 'delivery'],
        content: `روش‌های ارسال:
- پست پیشتاز: ۳ تا ۵ روز کاری
- تیپاکس: ۱ تا ۳ روز کاری
- پیک تهران: همان روز (سفارش‌های قبل از ساعت ۱۲)

هزینه ارسال:
- سفارش‌های بالای ۵۰۰,۰۰۰ تومان: ارسال رایگان
- سفارش‌های کمتر: ۸۰,۰۰۰ تومان

رهگیری مرسوله از طریق پنل کاربری یا لینک ارسال‌شده در پیامک امکان‌پذیر است.`,
    },
    {
        title: 'راهنمای استفاده از گارانتی',
        category: 'warranty',
        tags: ['گارانتی', 'ضمانت', 'خرابی', 'warranty'],
        content: `محصولات الکترونیکی دارای ۱۸ ماه گارانتی شرکتی هستند.

پوشش گارانتی:
- ایرادات فنی و سخت‌افزاری
- مشکل باتری (در ۶ ماه اول)
- خرابی صفحه‌نمایش در صورت عدم آسیب فیزیکی

خارج از گارانتی:
- آسیب فیزیکی، آب‌خوردگی، ضربه
- دستکاری توسط افراد غیرمجاز
- استفاده نادرست بر خلاف دفترچه راهنما

برای استفاده از گارانتی، فاکتور خرید و کارت گارانتی الزامی است.`,
    },
    {
        title: 'سوالات متداول (FAQ)',
        category: 'faq',
        tags: ['سوال', 'پرسش', 'FAQ', 'راهنما'],
        content: `س: چطور می‌توانم سفارشم را پیگیری کنم؟
ج: از پنل کاربری → بخش سفارش‌ها → مشاهده وضعیت

س: آیا امکان تغییر آدرس بعد از ثبت سفارش وجود دارد؟
ج: بله، تا قبل از ارسال از طریق پشتیبانی

س: کد تخفیف را کجا وارد کنم؟
ج: در مرحله پرداخت، فیلد "کد تخفیف"

س: آیا می‌توانم فاکتور رسمی دریافت کنم؟
ج: بله، در زمان خرید گزینه "فاکتور رسمی" را فعال کنید

س: ساعت پاسخگویی پشتیبانی چه زمانی است؟
ج: شنبه تا پنجشنبه، ۹ صبح تا ۶ عصر`,
    },
];

async function run() {
    try {
        await connectDatabase();
        logger.info('🌱 Seeding knowledge base...');

        await KnowledgeDoc.deleteMany({});
        const inserted = await KnowledgeDoc.insertMany(DOCS);

        logger.info(`📚 Knowledge documents seeded: ${inserted.length}`);
        logger.info('✅ Knowledge base seed complete!');

        await disconnectDatabase();
        process.exit(0);
    } catch (err) {
        logger.error(`Seed failed: ${err.message}`);
        await disconnectDatabase();
        process.exit(1);
    }
}

run();