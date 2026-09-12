// src/app/(dashboard)/layout.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useChatStore } from '@/store/chat.store';
import { Sidebar } from '@/components/layout/sidebar';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, accessToken } = useAuthStore();
  const { setActiveConversation } = useChatStore();

  useEffect(() => {
    // اگه لاگین نیست، برو login
    if (!accessToken || !user) {
      router.replace('/login');
    }
  }, [accessToken, user, router]);

  // sync activeConversation از URL
  useEffect(() => {
    const match = window.location.pathname.match(/\/chat\/([^/]+)/);
    setActiveConversation(match?.[1] ?? null);
  }, [setActiveConversation]);

  if (!accessToken || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}