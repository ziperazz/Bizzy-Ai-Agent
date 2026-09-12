// src/components/layout/header.tsx
'use client';

import { usePathname } from 'next/navigation';
import { useChatStore } from '@/store/chat.store';
import { Sparkles } from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const { conversations, activeConversationId } = useChatStore();

  const current = conversations.find((c) => c._id === activeConversationId);
  const isRoot = pathname === '/chat';

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur">
      <div className="flex items-center gap-2 text-sm">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="font-medium">
          {isRoot ? 'دستیار هوشمند کسب‌وکار' : current?.title ?? 'چت'}
        </span>
      </div>
    </header>
  );
}