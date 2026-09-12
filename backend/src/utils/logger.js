// src/utils/logger.js
import { env } from '../config/env.js';

const COLORS = {
    reset: '\x1b[0m',
    gray: '\x1b[90m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    green: '\x1b[32m',
    magenta: '\x1b[35m',
};

const LEVELS = {
    error: { label: 'ERROR', color: COLORS.red },
    warn: { label: 'WARN ', color: COLORS.yellow },
    info: { label: 'INFO ', color: COLORS.green },
    http: { label: 'HTTP ', color: COLORS.magenta },
    debug: { label: 'DEBUG', color: COLORS.blue },
};

const isProd = env.NODE_ENV === 'production';

function timestamp() {
    return new Date().toISOString();
}

function write(level, ...args) {
    if (isProd && level === 'debug') return;

    const meta = LEVELS[level] ?? LEVELS.info;
    const prefix = `${COLORS.gray}${timestamp()}${COLORS.reset} ${meta.color}[${meta.label}]${COLORS.reset}`;

    // eslint-disable-next-line no-console
    (level === 'error' ? console.error : console.log)(prefix, ...args);
}

export const logger = {
    error: (...args) => write('error', ...args),
    warn: (...args) => write('warn', ...args),
    info: (...args) => write('info', ...args),
    http: (...args) => write('http', ...args),
    debug: (...args) => write('debug', ...args),
};