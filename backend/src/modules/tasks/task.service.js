// src/modules/tasks/task.service.js
import { Task } from './task.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { TASK_STATUS, TASK_PRIORITY } from '../../config/constants.js';

export async function createTask(data, userId) {
    return Task.create({
        ...data,
        createdBy: userId,
        assignedTo: data.assignedTo ?? userId,
    });
}

export async function listTasks({ userId, role, status, priority, limit = 20, skip = 0 } = {}) {
    const filter = {};
    // کاربر عادی فقط تسک‌های خودش رو می‌بینه
    if (role !== 'admin') {
        filter.$or = [{ createdBy: userId }, { assignedTo: userId }];
    }
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const [items, total] = await Promise.all([
        Task.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Math.min(limit, 100))
            .populate('assignedTo', 'email name')
            .lean({ virtuals: true }),
        Task.countDocuments(filter),
    ]);

    return { items, total };
}

export async function getTaskById(id, userId, role) {
    const task = await Task.findById(id)
        .populate('assignedTo', 'email name')
        .populate('createdBy', 'email name');

    if (!task) throw ApiError.notFound('Task not found');

    const isOwner =
        String(task.createdBy?._id) === String(userId) ||
        String(task.assignedTo?._id) === String(userId);

    if (!isOwner && role !== 'admin') {
        throw ApiError.forbidden('Access denied to this task');
    }

    return task;
}

export async function updateTask(id, userId, role, updates) {
    const task = await Task.findById(id);
    if (!task) throw ApiError.notFound('Task not found');

    const isOwner =
        String(task.createdBy) === String(userId) ||
        String(task.assignedTo) === String(userId);

    if (!isOwner && role !== 'admin') {
        throw ApiError.forbidden('Access denied to this task');
    }

    const allowed = ['title', 'description', 'status', 'priority', 'dueDate', 'tags'];
    for (const key of allowed) {
        if (updates[key] !== undefined) task[key] = updates[key];
    }
    if (updates.relatedProducts) task.relatedProducts = updates.relatedProducts;

    await task.save();
    return task;
}

export async function deleteTask(id, userId, role) {
    const task = await Task.findById(id);
    if (!task) throw ApiError.notFound('Task not found');

    const isOwner = String(task.createdBy) === String(userId);
    if (!isOwner && role !== 'admin') {
        throw ApiError.forbidden('Only owner or admin can delete this task');
    }

    await task.deleteOne();
    return { deleted: true, id };
}