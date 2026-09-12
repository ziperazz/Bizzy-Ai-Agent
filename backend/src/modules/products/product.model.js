// src/modules/products/product.model.js
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
            maxlength: 200,
            index: true,
        },
        sku: {
            type: String,
            required: [true, 'SKU is required'],
            unique: true,
            trim: true,
            uppercase: true,
            index: true,
        },
        description: {
            type: String,
            trim: true,
            maxlength: 5000,
            default: '',
        },
        category: {
            type: String,
            trim: true,
            index: true,
            default: 'general',
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative'],
        },
        cost: {
            type: Number,
            min: 0,
            default: 0,
        },
        stock: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
            index: true,
        },
        lowStockThreshold: {
            type: Number,
            min: 0,
            default: 5,
        },
        tags: {
            type: [String],
            default: [],
            index: true,
        },
        isActive: {
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
                return ret;
            },
        },
    }
);

// ایندکس متنی برای جستجو
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Virtual: آیا کم‌موجود است؟
productSchema.virtual('isLowStock').get(function () {
    return this.stock <= this.lowStockThreshold;
});

// Virtual: حاشیه سود
productSchema.virtual('margin').get(function () {
    if (!this.price) return 0;
    return ((this.price - this.cost) / this.price) * 100;
});

export const Product =
    mongoose.models.Product || mongoose.model('Product', productSchema);