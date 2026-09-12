// scripts/test-sse.js
// اجرا: node scripts/test-sse.js
//
// تست SSE endpoint به صورت زنده

const API_BASE = 'http://localhost:5000/api';
const ADMIN = { email: 'admin@example.com', password: 'admin12345' };
const MESSAGE = 'فروش این ماه چقدر بوده؟';

async function main() {
    // 1) Login
    console.log('🔐 Logging in...');
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ADMIN),
    });

    if (!loginRes.ok) {
        console.error('❌ Login failed:', await loginRes.text());
        process.exit(1);
    }

    const { data: loginData } = await loginRes.json();
    const token = loginData.accessToken;
    console.log('✅ Logged in');

    // 2) ساخت مکالمه
    console.log('💬 Creating conversation...');
    const convRes = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: 'SSE Test' }),
    });
    const { data: conv } = await convRes.json();
    console.log(`✅ Conversation: ${conv._id}\n`);

    // 3) باز کردن SSE stream
    console.log('📡 Opening SSE stream...\n');
    console.log('─'.repeat(60));

    const streamRes = await fetch(`${API_BASE}/chat/${conv._id}/messages/stream`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
        },
        body: JSON.stringify({ message: MESSAGE }),
    });

    if (!streamRes.ok) {
        console.error('❌ Stream failed:', streamRes.status, await streamRes.text());
        process.exit(1);
    }

    // 4) خواندن SSE stream
    const reader = streamRes.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // پردازش eventهای کامل
        const parts = buffer.split('\n\n');
        buffer = parts.pop() ?? '';

        for (const part of parts) {
            if (!part.trim()) continue;

            const lines = part.split('\n');
            let event = 'message';
            let data = '';

            for (const line of lines) {
                if (line.startsWith('event: ')) event = line.slice(7).trim();
                else if (line.startsWith('data: ')) data += line.slice(6);
                else if (line.startsWith(':')) {
                    // comment/ping
                }
            }

            if (!data) continue;

            let parsed;
            try {
                parsed = JSON.parse(data);
            } catch {
                parsed = data;
            }

            // نمایش زیبا
            printEvent(event, parsed);
        }
    }

    console.log('─'.repeat(60));
    console.log('✅ Stream closed');
}

function printEvent(event, data) {
    const timestamp = new Date().toISOString().slice(11, 19);

    switch (event) {
        case 'connected':
            console.log(`[${timestamp}] 🔗 connected`);
            break;

        case 'step':
            if (data.type === 'step_start') {
                console.log(`[${timestamp}] ⏳ step ${data.step} started`);
            } else if (data.type === 'tool_call') {
                console.log(`[${timestamp}] 🔧 tool_call: ${data.tool}`);
                console.log(`              args: ${JSON.stringify(data.args)}`);
            } else if (data.type === 'tool_result') {
                console.log(
                    `[${timestamp}] ${data.ok ? '✅' : '❌'} tool_result: ${data.tool}`
                );
            } else if (data.type === 'final') {
                console.log(`[${timestamp}] 🤖 final answer:`);
                console.log('─'.repeat(60));
                console.log(data.content);
                console.log('─'.repeat(60));
            } else if (data.type === 'limit_reached') {
                console.log(`[${timestamp}] ⚠️  limit reached: ${data.content}`);
            }
            break;

        case 'done':
            console.log(`[${timestamp}] ✅ done`);
            if (data.usage) {
                console.log(
                    `              tokens: ${data.usage.total_tokens} (prompt: ${data.usage.prompt_tokens}, completion: ${data.usage.completion_tokens})`
                );
            }
            break;

        case 'error':
            console.log(`[${timestamp}] ❌ error: ${data.message}`);
            break;

        default:
            console.log(`[${timestamp}] ${event}:`, data);
    }
}

main().catch((err) => {
    console.error('Fatal:', err);
    process.exit(1);
});