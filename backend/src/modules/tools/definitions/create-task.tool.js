// src/modules/tools/definitions/create-task.tool.js
import { z } from 'zod';
import { Task } from '../../tasks/task.model.js';
import { registerTool } from '../tools.registry.js';
import { TASK_PRIORITY } from '../../../config/constants.js';

const schema = z.object({
    title: z.string().trim().min(3).max(300),
    description: z.string().trim().max(5000).optional().default(''),
    priority: z.enum(Object.values(TASK_PRIORITY)).default('medium'),
    relatedProductIds: z.array(z.string()).optional().default([]),
    dueDate: z.string().datetime().optional(),
});

registerTool({
    name: 'create_task',
    description:
        'Create a follow-up task for the current user. Use this when the user wants to be reminded or wants something assigned for review.',
    jsonSchema: {
        type: 'object',
        properties: {
            title: { type: 'string', description: 'Short descriptive title for the task.' },
            description: { type: 'string', description: 'Optional detailed description.' },
            priority: {
                type: 'string',
                enum: ['low', 'medium', 'high'],
                description: 'Task priority. Default "medium".',
            },
            relatedProductIds: {
                type: 'array',
                items: { type: 'string' },
                description: 'Optional list of product IDs related to this task.',
            },
            dueDate: {
                type: 'string',
                description: 'Optional due date in ISO 8601 format.',
            },
        },
        required: ['title'],
    },
    schema,
    allowedRoles: ['user', 'admin'],
    async execute(args, context) {
        const task = await Task.create({
            title: args.title,
            description: args.description,
            priority: args.priority,
            dueDate: args.dueDate ? new Date(args.dueDate) : null,
            relatedProducts: args.relatedProductIds ?? [],
            createdBy: context?.userId ?? null,
            assignedTo: context?.userId ?? null,
            sourceConversation: context?.conversationId ?? null,
        });

        return {
            id: task._id,
            title: task.title,
            priority: task.priority,
            status: task.status,
            dueDate: task.dueDate,
            createdAt: task.createdAt,
        };
    },
});