// src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Toaster } from 'sonner';
import { azarMehr, outfit } from '@/lib/fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Business Assistant',
  description: 'دستیار هوشمند کسب‌وکار با Agent و Tool Calling',
};

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      suppressHydrationWarning
      className={`${outfit.variable} ${azarMehr.variable}`}
    >
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {children}
        <Toaster
          position="top-center"
          richColors
          dir="rtl"
          closeButton
        />
      </body>
    </html>
  );
}