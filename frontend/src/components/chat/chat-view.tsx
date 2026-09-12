// src/components/chat/chat-view.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '@/store/chat.store';
import { useAuthStore } from '@/store/auth.store';
import { MessageBubble } from './message-bubble';
import { ChatInput } from './chat-input';
import { AgentActivity } from '@/components/agent/agent-activity';
import * as chatApi from '@/lib/chat-api';
import { toast } from 'sonner';
import { Bot, Sparkles } from 'lucide-react';

interface Props {
  conversationId: string;
}

export function ChatView({ conversationId }: Props) {
  const { user } = useAuthStore();
  const {
    messages,
    setMessages,
    addMessage,
    clearSteps,
    appendStep,
    isStreaming,
    setStreaming,
    error,
    setError,
  } = useChatStore();

  const [loading, setLoading] = useState(true);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load messages
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    chatApi
      .getMessages(conversationId)
      .then((msgs) => {
        if (!cancelled) setMessages(msgs);
      })
      .catch((err) => {
        if (!cancelled)
          toast.error(err?.response?.data?.error?.message ?? 'خطا در بارگذاری');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [conversationId, setMessages]);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isStreaming]);

  const handleSend = async (content: string) => {
    if (!user) return;
    setError(null);
    clearSteps();

    // Optimistic user message
    const tempUserMsg: chatApi.Message = {
      _id: `temp-${Date.now()}`,
      conversation: conversationId,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };
    addMessage(tempUserMsg);

    setStreaming(true);
    abortRef.current = new AbortController();

    let finalContent = '';

    try {
      await chatApi.streamMessage(
        conversationId,
        content,
        {
          onStep: (step) => appendStep(step),
          onDone: (data) => {
            finalContent = data.assistantMessage.content;
          },
          onError: (err) => {
            toast.error(err.message);
            setError(err.message);
          },
        },
        abortRef.current.signal
      );

      // Add final assistant message
      if (finalContent) {
        addMessage({
          _id: `assistant-${Date.now()}`,
          conversation: conversationId,
          role: 'assistant',
          content: finalContent,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err: unknown) {
      if ((err as Error).name !== 'AbortError') {
        toast.error('خطا در ارتباط با سرور');
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setStreaming(false);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 sm:px-6"
      >
        <div className="mx-auto max-w-3xl space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Sparkles className="h-6 w-6 animate-pulse text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <EmptyState userName={user?.name ?? ''} />
          ) : (
            messages.map((m) => <MessageBubble key={m._id} message={m} />)
          )}

          {isStreaming && (
            <div className="space-y-3">
              <AgentActivity />
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="border-t bg-background/95 backdrop-blur px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <ChatInput
            onSend={handleSend}
            onStop={handleStop}
            isStreaming={isStreaming}
            disabled={loading}
          />
          <p className="mt-2 text-center text-[10px] text-muted-foreground">
            Agent ممکنه اشتباه کنه. اطلاعات مهم رو بررسی کن.
          </p>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ userName }: { userName: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        <Bot className="h-8 w-8 text-primary" />
      </div>
      <h2 className="mb-1 text-xl font-semibold">
        سلام {userName.split(' ')[0] || 'دوست من'} 👋
      </h2>
      <p className="max-w-md text-sm text-muted-foreground">
        من دستیار هوشمند کسبوکار تو هستم. میتونم گزارش فروش بدم، محصولات رو
        بررسی کنم، تسک بسازم، و از اسناد شرکت جواب بدم.
      </p>
      <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <SuggestionCard text="فروش این ماه چقدر بوده؟" />
        <SuggestionCard text="محصولات کمموجود رو پیدا کن" />
        <SuggestionCard text="شرایط مرجوعی چیه؟" />
        <SuggestionCard text="برای Mechanical Keyboard توضیح سئو بنویس" />
      </div>
    </div>
  );
}

function SuggestionCard({ text }: { text: string }) {
  return (
    <button
      type="button"
      className="rounded-lg border bg-card p-3 text-right text-xs transition-colors hover:bg-accent"
      onClick={() => {
        // dispatch custom event که chat-view گوش بده
        window.dispatchEvent(
          new CustomEvent('chat-suggestion', { detail: text })
        );
      }}
    >
      {text}
    </button>
  );
}