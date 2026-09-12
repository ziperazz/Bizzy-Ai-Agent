// src/app/(dashboard)/chat/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { ChatView } from '@/components/chat/chat-view';

export default function ChatPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  if (!id) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        مکالمه‌ای انتخاب نشده
      </div>
    );
  }

  return <ChatView conversationId={id} />;
}