// src/components/agent/agent-step.tsx
'use client';

import { cn } from '@/lib/utils';
import type { AgentStep } from '@/lib/chat-api';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
  Wrench,
  Zap,
} from 'lucide-react';

interface Props {
  step: AgentStep;
  isLive?: boolean;
}

export function AgentStepItem({ step, isLive }: Props) {
  if (step.type === 'step_start') {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>مرحله {step.step} — در حال بررسی...</span>
      </div>
    );
  }

  if (step.type === 'tool_call') {
    return (
      <div className="flex flex-col gap-1 rounded-lg border border-blue-500/20 bg-blue-500/5 p-2.5 text-xs">
        <div className="flex items-center gap-2">
          <Wrench className="h-3.5 w-3.5 text-blue-500" />
          <span className="font-medium text-blue-500">
            اجرای ابزار: {step.tool}
          </span>
          {isLive && <Loader2 className="mr-auto h-3 w-3 animate-spin" />}
        </div>
        {step.args && Object.keys(step.args).length > 0 && (
          <pre
            dir="ltr"
            className="mt-1 overflow-x-auto rounded bg-muted/50 p-1.5 text-left text-[10px] text-muted-foreground"
          >
            {JSON.stringify(step.args, null, 2)}
          </pre>
        )}
      </div>
    );
  }

  if (step.type === 'tool_result') {
    return (
      <div
        className={cn(
          'flex items-center gap-2 text-xs',
          step.ok
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-destructive'
        )}
      >
        {step.ok ? (
          <CheckCircle2 className="h-3.5 w-3.5" />
        ) : (
          <XCircle className="h-3.5 w-3.5" />
        )}
        <span>
          {step.ok ? 'نتیجه دریافت شد' : 'خطا در اجرا'}: {step.tool}
        </span>
      </div>
    );
  }

  if (step.type === 'final') {
    return (
      <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
        <Sparkles className="h-3.5 w-3.5" />
        <span>پاسخ نهایی آماده شد</span>
      </div>
    );
  }

  if (step.type === 'limit_reached') {
    return (
      <div className="flex items-center gap-2 text-xs text-amber-600">
        <Zap className="h-3.5 w-3.5" />
        <span>به محدودیت مراحل رسید</span>
      </div>
    );
  }

  return null;
}