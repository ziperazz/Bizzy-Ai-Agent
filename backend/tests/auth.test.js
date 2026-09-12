// tests/auth.test.js
import './setup.js';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import mongoose from 'mongoose';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/db.js';
import { User } from '../src/modules/auth/user.model.js';

const app = createApp();

beforeAll(async () => {
    await connectDatabase();
    await User.deleteMany({});
});

afterAll(async () => {
    await User.deleteMany({});
    await disconnectDatabase();
    await mongoose.disconnect();
});

describe('Auth API', () => {
    const testUser = {
        email: 'test@example.com',
        password: 'test12345',
        name: 'Test User',
    };

    it('should register a new user', async () => {
        const res = await request(app).post('/api/auth/register').send(testUser);

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.user.email).toBe(testUser.email);
        expect(res.body.data.accessToken).toBeDefined();
        expect(res.body.data.user.password).toBeUndefined();
    });

    it('should reject duplicate email', async () => {
        const res = await request(app).post('/api/auth/register').send(testUser);

        expect(res.status).toBe(409);
        expect(res.body.success).toBe(false);
        expect(res.body.error.code).toBe('CONFLICT');
    });

    it('should login with correct credentials', async () => {
        const res = await request(app).post('/api/auth/login').send({
            email: testUser.email,
            password: testUser.password,
        });

        expect(res.status).toBe(200);
        expect(res.body.data.accessToken).toBeDefined();
    });

    it('should reject wrong password', async () => {
        const res = await request(app).post('/api/auth/login').send({
            email: testUser.email,
            password: 'wrong_password',
        });

        expect(res.status).toBe(401);
    });

    it('should reject invalid email format', async () => {
        const res = await request(app).post('/api/auth/register').send({
            email: 'not-an-email',
            password: 'password123',
        });

        expect(res.status).toBe(422);
        expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should get current user with valid token', async () => {
        const login = await request(app).post('/api/auth/login').send({
            email: testUser.email,
            password: testUser.password,
        });

        const token = login.body.data.accessToken;

        const res = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.data.email).toBe(testUser.email);
    });

    it('should reject request without token', async () => {
        const res = await request(app).get('/api/auth/me');
        expect(res.status).toBe(401);
    });
});