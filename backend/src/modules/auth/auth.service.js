// src/modules/auth/auth.service.js
import jwt from 'jsonwebtoken';
import { User } from './user.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { env } from '../../config/env.js';

function signTokens(user) {
    const payload = { sub: String(user._id), role: user.role };
    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN,
    });
    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
        expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    });
    return { accessToken, refreshToken };
}

export async function register({ email, password, name }) {
    const exists = await User.findOne({ email });
    if (exists) throw ApiError.conflict('Email already registered');

    const user = await User.create({ email, password, name });
    const tokens = signTokens(user);
    return { user: user.toSafeJSON(), ...tokens };
}

export async function login({ email, password }) {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
        throw ApiError.unauthorized('Invalid email or password');
    }
    if (!user.isActive) throw ApiError.forbidden('Account is disabled');

    const tokens = signTokens(user);
    return { user: user.toSafeJSON(), ...tokens };
}

export function verifyAccessToken(token) {
    return jwt.verify(token, env.JWT_SECRET);
}