// src/components/layout/sidebar.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/auth.store';
import { useChatStore } from '@/store/chat.store';
import * as chatApi from '@/lib/chat-api';
import { cn, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Plus,
  MessageSquare,
  LogOut,
  Bot,
  Loader2,
  PanelLeftClose,
  Settings,
} from 'lucide-react';

interface Props {
  onClose?: () => void;
}

export function Sidebar({ onClose }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { conversations, setConversations, activeConversationId } = useChatStore();
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    chatApi
      .listConversations()
      .then((items) => {
        if (!cancelled) setConversations(items);
      })
      .catch(() => {
        if (!cancelled) toast.error('خطا در بارگذاری مکالمات');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [setConversations]);

  const handleNewChat = async () => {
    if (creating) return;
    setCreating(true);
    try {
      const conv = await chatApi.createConversation();
      setConversations([conv, ...conversations]);
      router.push(`/chat/${conv._id}`);
      onClose?.();
    } catch {
      toast.error('خطا در ساخت مکالمه');
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside className="flex h-full w-72 flex-col border-l bg-muted/30">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-3">
        <Link href="/chat" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Bot className="h-4 w-4" />
          </div>
          <span className="font-bold">Bizzy</span>
        </Link>
        {onClose && (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <PanelLeftClose className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* New chat */}
      <div className="p-3">
        <Button
          onClick={handleNewChat}
          disabled={creating}
          className="w-full justify-start gap-2"
        >
          {creating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          چت جدید
        </Button>
      </div>

      {/* Nav links (Settings) */}
      <div className="px-3 pb-2">
        <Link
          href="/settings"
          onClick={onClose}
          className={cn(
            'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
            pathname === '/settings'
              ? 'bg-primary/10 text-primary'
              : 'hover:bg-accent'
          )}
        >
          <Settings className="h-4 w-4" />
          تنظیمات مدل
        </Link>
      </div>

      {/* Conversations */}
      <ScrollArea className="flex-1 px-2">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="px-3 py-8 text-center text-xs text-muted-foreground">
            هنوز مکالمه‌ای نداری
          </div>
        ) : (
          <div className="space-y-1 pb-3">
            {conversations.map((c) => {
              const isActive =
                activeConversationId === c._id ||
                pathname === `/chat/${c._id}`;
              return (
                <Link
                  key={c._id}
                  href={`/chat/${c._id}`}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-accent'
                  )}
                >
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate">{c.title}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {formatDate(c.lastMessageAt)}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* User */}
      <div className="border-t p-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-primary">
              {user?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? '?'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{user?.name || 'کاربر'}</div>
            <div className="truncate text-[10px] text-muted-foreground">
              {user?.email}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={handleLogout}
            title="خروج"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}