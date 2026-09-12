// src/components/agent/agent-activity.tsx
'use client';

import { useChatStore } from '@/store/chat.store';
import { AgentStepItem } from './agent-step';
import { Card } from '@/components/ui/card';
import { Activity, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useRef } from 'react';

export function AgentActivity() {
  const { liveSteps, isStreaming, clearSteps } = useChatStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [liveSteps]);

  if (liveSteps.length === 0 && !isStreaming) return null;

  return (
    <Card className="border-l-4 border-l-primary bg-muted/30 overflow-hidden">
      <div className="flex items-center justify-between border-b bg-muted/50 px-3 py-2">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary animate-pulse" />
          <span className="text-sm font-medium">فعالیت Agent</span>
          {isStreaming && (
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
          )}
        </div>
        {!isStreaming && liveSteps.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={clearSteps}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <div
        ref={scrollRef}
        className="max-h-64 space-y-3 overflow-y-auto p-3"
      >
        {liveSteps.map((step, i) => (
          <AgentStepItem
            key={i}
            step={step}
            isLive={isStreaming && i === liveSteps.length - 1}
          />
        ))}
      </div>
    </Card>
  );
}