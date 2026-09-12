// src/modules/tasks/task.controller.js
import { z } from 'zod';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { successResponse } from '../../utils/apiResponse.js';
import * as taskService from './task.service.js';
import { TASK_STATUS, TASK_PRIORITY } from '../../config/constants.js';

const createSchema = z.object({
    title: z.string().trim().min(3).max(300),
    description: z.string().trim().max(5000).optional().default(''),
    priority: z.enum(Object.values(TASK_PRIORITY)).optional(),
    status: z.enum(Object.values(TASK_STATUS)).optional(),
    dueDate: z.string().datetime().optional(),
    relatedProducts: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    assignedTo: z.string().optional(),
});

const updateSchema = createSchema.partial();

export const createTask = asyncHandler(async (req, res) => {
    const data = createSchema.parse(req.body);
    const task = await taskService.createTask(data, req.user.id);
    return successResponse(res, task, { statusCode: 201, message: 'Task created' });
});

export const listTasks = asyncHandler(async (req, res) => {
    const result = await taskService.listTasks({
        userId: req.user.id,
        role: req.user.role,
        status: req.query.status,
        priority: req.query.priority,
        limit: Number(req.query.limit ?? 20),
        skip: Number(req.query.skip ?? 0),
    });
    return successResponse(res, result.items, { meta: { total: result.total } });
});

export const getTask = asyncHandler(async (req, res) => {
    const task = await taskService.getTaskById(req.params.id, req.user.id, req.user.role);
    return successResponse(res, task);
});

export const updateTask = asyncHandler(async (req, res) => {
    const updates = updateSchema.parse(req.body);
    const task = await taskService.updateTask(
        req.params.id,
        req.user.id,
        req.user.role,
        updates
    );
    return successResponse(res, task, { message: 'Task updated' });
});

export const deleteTask = asyncHandler(async (req, res) => {
    const result = await taskService.deleteTask(req.params.id, req.user.id, req.user.role);
    return successResponse(res, result, { message: 'Task deleted' });
});