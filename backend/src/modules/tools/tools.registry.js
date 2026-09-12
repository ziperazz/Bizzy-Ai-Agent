// src/modules/tools/tools.registry.js
/**
 * رجیستری مرکزی toolها.
 * هر tool: { name, description, jsonSchema, schema (zod), allowedRoles, execute, assertAccess?, timeoutMs? }
 */

const registry = new Map();

export function registerTool(tool) {
    if (!tool?.name) throw new Error('Tool must have a name');
    if (registry.has(tool.name)) {
        throw new Error(`Tool "${tool.name}" is already registered`);
    }
    registry.set(tool.name, Object.freeze(tool));
}

export const toolsRegistry = {
    get: (name) => registry.get(name),
    getAll: () => Array.from(registry.values()),
    has: (name) => registry.has(name),
    size: () => registry.size,
};