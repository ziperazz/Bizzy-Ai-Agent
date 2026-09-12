// src/modules/tools/definitions/index.js
// این فایل همه toolها را side-effect import می‌کند تا در registry ثبت شوند.

// === فاز ۱ (MVP) ===
import './get-products.tool.js';
import './get-sales-report.tool.js';
import './get-low-stock.tool.js';
import './create-task.tool.js';

// === فاز ۲ (تکمیل) ===
import './create-product-description.tool.js';
import './search-knowledge-base.tool.js';

export * from '../tools.registry.js';