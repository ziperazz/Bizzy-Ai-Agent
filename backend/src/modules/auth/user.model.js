// src/modules/auth/user.model.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { USER_ROLES } from '../../config/constants.js';

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: 8,
            select: false,
        },
        name: {
            type: String,
            trim: true,
            maxlength: 100,
            default: '',
        },
        role: {
            type: String,
            enum: Object.values(USER_ROLES),
            default: USER_ROLES.USER,
            index: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        lastLoginAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: (_doc, ret) => {
                delete ret.__v;
                delete ret.password;
                return ret;
            },
        },
    }
);

// هش کردن پسورد قبل از ذخیره
userSchema.pre('save', async function hashPassword(next) {
    if (!this.isModified('password')) return next();
    try {
        this.password = await bcrypt.hash(this.password, 12);
        next();
    } catch (err) {
        next(err);
    }
});

// مقایسه پسورد
userSchema.methods.comparePassword = function comparePassword(candidate) {
    return bcrypt.compare(candidate, this.password);
};

// خروجی امن
userSchema.methods.toSafeJSON = function toSafeJSON() {
    return {
        id: this._id,
        email: this.email,
        name: this.name,
        role: this.role,
        isActive: this.isActive,
        createdAt: this.createdAt,
    };
};

export const User = mongoose.models.User || mongoose.model('User', userSchema);