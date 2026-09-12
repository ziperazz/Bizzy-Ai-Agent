// src/config/swagger.js
import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env.js';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'AI Business Assistant API',
            version: '1.0.0',
            description:
                'AI-powered business assistant with Agent, Tool Calling, and Knowledge Base',
        },
        servers: [
            {
                url: `http://localhost:${env.PORT}`,
                description: 'Local development',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                ApiResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                        data: { type: 'object' },
                    },
                },
                ApiError: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        error: {
                            type: 'object',
                            properties: {
                                code: { type: 'string' },
                                message: { type: 'string' },
                            },
                        },
                    },
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ['./src/modules/**/*.routes.js', './src/routes/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);