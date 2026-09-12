// src/app/(dashboard)/chat/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Bot, Plus, Loader2 } from 'lucide-react';
import * as chatApi from '@/lib/chat-api';
import { useChatStore } from '@/store/chat.store';
import { toast } from 'sonner';

export default function ChatRootPage() {
  const router = useRouter();
  const { conversations, setConversations } = useChatStore();
  const [creating, setCreating] = useState(false);

  const handleNewChat = async () => {
    setCreating(true);
    try {
      const conv = await chatApi.createConversation();
      setConversations([conv, ...conversations]);
      router.push(`/chat/${conv._id}`);
    } catch {
      toast.error('خطا در ساخت مکالمه');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10">
        <Bot className="h-10 w-10 text-primary" />
      </div>
      <h1 className="mb-2 text-2xl font-bold">خوش اومدی 👋</h1>
      <p className="mb-6 max-w-md text-sm text-muted-foreground">
        یه مکالمه جدید شروع کن یا از مکالمات قبلی انتخاب کن.
      </p>
      <Button onClick={handleNewChat} disabled={creating} size="lg" className="gap-2">
        {creating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
        شروع مکالمه جدید
      </Button>
    </div>
  );
}