// src/app/(auth)/register/page.tsx
import { RegisterForm } from '@/components/auth/register-form';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary/5 to-background px-6">
      <RegisterForm />
    </div>
  );
}