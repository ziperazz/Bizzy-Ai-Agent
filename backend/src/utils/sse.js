// src/utils/sse.js

/**
 * راهاندازی یک SSE stream روی response.
 * هدرهای لازم رو ست میکنه و یه writer برمیگردونه.
 *
 * @param {import('express').Response} res
 * @returns {{
 *   send: (event: string, data: any) => void,
 *   comment: (text: string) => void,
 *   close: () => void,
 *   isClosed: () => boolean,
 * }}
 */
export function createSSEStream(res) {
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // برای Nginx
    res.flushHeaders?.();

    let closed = false;

    const write = (chunk) => {
        if (closed) return;
        try {
            res.write(chunk);
        } catch {
            closed = true;
        }
    };

    // keep-alive ping هر 15 ثانیه
    const pingInterval = setInterval(() => {
        write(`: ping\n\n`);
    }, 15_000);

    res.on('close', () => {
        closed = true;
        clearInterval(pingInterval);
    });

    return {
        send(event, data) {
            const payload = typeof data === 'string' ? data : JSON.stringify(data);
            write(`event: ${event}\ndata: ${payload}\n\n`);
        },
        comment(text) {
            write(`: ${text}\n\n`);
        },
        close() {
            if (closed) return;
            closed = true;
            clearInterval(pingInterval);
            try {
                res.end();
            } catch {
                /* noop */
            }
        },
        isClosed: () => closed,
    };
}