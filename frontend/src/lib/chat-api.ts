// src/lib/chat-api.ts
import { api, ApiResponse } from './api';

export interface Conversation {
  _id: string;
  title: string;
  status: 'active' | 'archived';
  lastMessageAt: string;
  messageCount: number;
  createdAt: string;
}

export interface Message {
  _id: string;
  conversation: string;
  role: 'user' | 'assistant' | 'tool' | 'system';
  content: string;
  toolCalls?: Array<{
    name: string;
    args: Record<string, unknown>;
    ok: boolean;
    result?: unknown;
    error?: string;
  }>;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  createdAt: string;
}

export interface AgentStep {
  type: 'step_start' | 'tool_call' | 'tool_result' | 'final' | 'limit_reached';
  step?: number;
  tool?: string;
  args?: Record<string, unknown>;
  ok?: boolean;
  content?: string;
}

export async function listConversations(): Promise<Conversation[]> {
  const { data } = await api.get<ApiResponse<Conversation[]>>('/chat');
  return data.data;
}

export async function createConversation(title?: string): Promise<Conversation> {
  const { data } = await api.post<ApiResponse<Conversation>>('/chat', { title });
  return data.data;
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const { data } = await api.get<ApiResponse<Message[]>>(
    `/chat/${conversationId}/messages`
  );
  return data.data;
}

export async function deleteConversation(id: string): Promise<void> {
  await api.delete(`/chat/${id}`);
}

// === SSE Streaming ===
export interface StreamCallbacks {
  onConnected?: (data: { conversationId: string }) => void;
  onStep?: (step: AgentStep) => void;
  onDone?: (data: {
    conversationId: string;
    assistantMessage: { id: string; content: string; createdAt: string };
    usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
  }) => void;
  onError?: (err: { message: string; code?: string }) => void;
}

export async function streamMessage(
  conversationId: string,
  message: string,
  callbacks: StreamCallbacks,
  signal?: AbortSignal
): Promise<void> {
  const token = localStorage.getItem('accessToken');
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:5000/api';

  const response = await fetch(
    `${API_URL}/chat/${conversationId}/messages/stream`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ message }),
      signal,
    }
  );

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    callbacks.onError?.({
      message: errBody?.error?.message ?? 'Stream failed',
      code: errBody?.error?.code,
    });
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    callbacks.onError?.({ message: 'No response body' });
    return;
  }

  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop() ?? '';

    for (const part of parts) {
      if (!part.trim()) continue;
      const lines = part.split('\n');
      let event = 'message';
      let dataStr = '';

      for (const line of lines) {
        if (line.startsWith('event: ')) event = line.slice(7).trim();
        else if (line.startsWith('data: ')) dataStr += line.slice(6);
      }

      if (!dataStr) continue;

      let payload: unknown;
      try {
        payload = JSON.parse(dataStr);
      } catch {
        continue;
      }

      switch (event) {
        case 'connected':
          callbacks.onConnected?.(payload as { conversationId: string });
          break;
        case 'step':
          callbacks.onStep?.(payload as AgentStep);
          break;
        case 'done':
          callbacks.onDone?.(payload as Parameters<NonNullable<StreamCallbacks['onDone']>>[0]);
          break;
        case 'error':
          callbacks.onError?.(payload as { message: string; code?: string });
          break;
      }
    }
  }
}