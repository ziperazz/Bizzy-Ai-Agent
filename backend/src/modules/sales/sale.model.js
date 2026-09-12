// src/modules/sales/sale.model.js
import mongoose from 'mongoose';

const saleItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        productName: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true, min: 0 },
        total: { type: Number, required: true, min: 0 },
    },
    { _id: false }
);

const saleSchema = new mongoose.Schema(
    {
        orderNumber: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        customer: {
            name: { type: String, default: 'Walk-in Customer' },
            email: { type: String, default: null },
            phone: { type: String, default: null },
        },
        items: {
            type: [saleItemSchema],
            validate: {
                validator: (arr) => Array.isArray(arr) && arr.length > 0,
                message: 'Sale must have at least one item',
            },
        },
        totalAmount: { type: Number, required: true, min: 0 },
        discount: { type: Number, default: 0, min: 0 },
        finalAmount: { type: Number, required: true, min: 0 },
        status: {
            type: String,
            enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'],
            default: 'paid',
            index: true,
        },
        soldAt: {
            type: Date,
            default: Date.now,
            index: true,
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

saleSchema.index({ soldAt: -1, status: 1 });

export const Sale = mongoose.models.Sale || mongoose.model('Sale', saleSchema);