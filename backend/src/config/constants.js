// src/config/constants.js
export const USER_ROLES = Object.freeze({
    USER: 'user',
    ADMIN: 'admin',
});

export const MESSAGE_ROLES = Object.freeze({
    SYSTEM: 'system',
    USER: 'user',
    ASSISTANT: 'assistant',
    TOOL: 'tool',
});

export const CONVERSATION_STATUS = Object.freeze({
    ACTIVE: 'active',
    ARCHIVED: 'archived',
});

export const TASK_STATUS = Object.freeze({
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    DONE: 'done',
    CANCELLED: 'cancelled',
});

export const TASK_PRIORITY = Object.freeze({
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
});

export const HTTP_STATUS = Object.freeze({
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
});