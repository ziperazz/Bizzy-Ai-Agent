// src/app/(dashboard)/chat/layout.tsx
'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/header';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isRoot = pathname === '/chat';

  return (
    <div className="flex h-full flex-col">
      <Header />
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}