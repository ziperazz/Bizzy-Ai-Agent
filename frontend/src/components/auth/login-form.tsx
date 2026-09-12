// src/components/auth/login-form.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'sonner';
import { Loader2, Bot } from 'lucide-react';
import type { AxiosError } from 'axios';

export function LoginForm() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin12345');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success('خوش اومدی!');
      router.push('/chat');
    } catch (err) {
      const axiosErr = err as AxiosError<{ error: { message: string } }>;
      toast.error(
        axiosErr.response?.data?.error?.message ?? 'ایمیل یا رمز اشتباهه'
      );
    }
  };

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Bot className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold">خوش برگشتی</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          برای ادامه وارد حساب کاربری‌ت شو
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            ایمیل
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            dir="ltr"
            className="text-left"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            رمز عبور
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={8}
            dir="ltr"
            className="text-left"
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          ورود
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        حساب نداری؟{' '}
        <Link href="/register" className="font-medium text-primary hover:underline">
          ثبت‌نام کن
        </Link>
      </div>

      <div className="rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
        <div className="font-medium text-foreground">🔑 حساب تستی:</div>
        <div dir="ltr" className="mt-1 text-left">
          admin@example.com / admin12345
        </div>
      </div>
    </div>
  );
}