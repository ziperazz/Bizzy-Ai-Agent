// src/app/page.tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Bot,
  Sparkles,
  Zap,
  Database,
  Shield,
  ArrowLeft,
  MessageSquare,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Zap,
    title: 'Agent هوشمند',
    desc: 'خودش تصمیم می‌گیره از چه ابزاری استفاده کنه',
  },
  {
    icon: Database,
    title: '۶ ابزار عملیاتی',
    desc: 'گزارش فروش، انبار، تسک، محتوا، و دانش شرکت',
  },
  {
    icon: MessageSquare,
    title: 'پاسخ زنده',
    desc: 'مراحل اجرای Agent رو زنده ببین',
  },
  {
    icon: Shield,
    title: 'امنیت کامل',
    desc: 'JWT، نقش‌محور، Rate Limiting',
  },
];

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-background to-background" />
      <div className="absolute right-0 top-0 -z-10 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 -z-10 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b border-border/40 px-6 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Bot className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold">Bizzy</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/login">ورود</Link>
          </Button>
          <Button asChild>
            <Link href="/register">شروع کن</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-1.5 text-xs font-medium backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>ساخته شده با Agent + Tool Calling</span>
        </div>

        <h1 className="mb-4 max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl">
          دستیار هوشمند
          <span className="bg-gradient-to-l from-primary to-blue-500 bg-clip-text px-3 text-transparent">
            کسب‌وکار
          </span>
        </h1>

        <p className="mb-8 max-w-2xl text-base text-muted-foreground sm:text-lg">
          از چت با یه Agent که خودش تصمیم می‌گیره، ابزار انتخاب می‌کنه، و
          multi-step کار می‌کنه. گزارش فروش بگیر، محصولات کم‌موجود رو پیدا کن،
          تسک بساز، و از اسناد شرکت جواب بگیر — همه با یه پیام.
        </p>

        <div className="mb-12 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" asChild className="gap-2">
            <Link href="/register">
              شروع رایگان
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">حساب داری؟ وارد شو</Link>
          </Button>
        </div>

        {/* Demo preview */}
        <div className="mb-16 w-full max-w-2xl overflow-hidden rounded-2xl border bg-card text-right shadow-xl">
          <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-2">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500/70" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
              <div className="h-3 w-3 rounded-full bg-green-500/70" />
            </div>
            <span className="text-xs text-muted-foreground">چت با Bizzy</span>
          </div>
          <div className="space-y-3 p-4 text-sm">
            <div className="flex justify-end">
              <div className="max-w-[75%] rounded-2xl bg-primary px-4 py-2 text-primary-foreground">
                فروش این ماه چقدر بوده؟
              </div>
            </div>
            <div className="flex flex-col gap-1.5 rounded-lg border border-blue-500/20 bg-blue-500/5 p-2.5 text-xs text-blue-600 dark:text-blue-400">
              <div className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5" />
                <span className="font-medium">
                  اجرای ابزار: get_sales_report
                </span>
              </div>
            </div>
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl bg-muted px-4 py-2.5">
                📊 فروش این ماه:{' '}
                <span className="font-bold">۴۳,۲۵۵,۰۰۰ تومان</span> از{' '}
                <span className="font-bold">۱۲</span> سفارش
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border bg-card p-4 text-right transition-colors hover:bg-accent/50"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-1 text-sm font-semibold">{f.title}</h3>
              <p className="text-xs text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 px-6 py-4 text-center text-xs text-muted-foreground">
        ساخته شده با Node.js + Express + MongoDB + Next.js + OpenRouter
      </footer>
    </div>
  );
}