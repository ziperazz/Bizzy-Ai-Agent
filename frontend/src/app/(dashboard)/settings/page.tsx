// src/app/(dashboard)/settings/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSettingsStore } from '@/store/settings.store';
import * as settingsApi from '@/lib/settings-api';
import type { LLMModel, TestModelResult } from '@/lib/settings-api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Check,
  Loader2,
  Sparkles,
  Zap,
  Cpu,
  Coins,
  Timer,
  TestTube,
  Save,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const {
    settings,
    models,
    loading,
    saving,
    fetchSettings,
    fetchModels,
    updateSettings,
  } = useSettingsStore();

  const [selectedModel, setSelectedModel] = useState<string>('');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<TestModelResult | null>(null);

  useEffect(() => {
    fetchSettings();
    fetchModels();
  }, [fetchSettings, fetchModels]);

  useEffect(() => {
    if (settings) {
      setSelectedModel(settings.llm.model);
      setTemperature(settings.llm.temperature);
      setMaxTokens(settings.llm.maxTokens);
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateSettings({
        llm: {
          model: selectedModel,
          temperature,
          maxTokens,
        },
      });
      toast.success('تنظیمات ذخیره شد');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      toast.error(error?.response?.data?.error?.message ?? 'خطا در ذخیره');
    }
  };

  const handleTest = async (model: string) => {
    setTesting(model);
    setTestResult(null);
    try {
      const result = await settingsApi.testModel(model);
      setTestResult(result);
      if (result.ok) {
        toast.success(`مدل ${model} جواب داد (${result.latencyMs}ms)`);
      } else {
        toast.error(`مدل خطا داد: ${result.error}`);
      }
    } catch (err: unknown) {
      toast.error('خطا در تست');
    } finally {
      setTesting(null);
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">تنظیمات مدل</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          مدل LLM رو انتخاب کن، دما و حداکثر توکن رو تنظیم کن
        </p>
      </div>

      {/* Current Model Info */}
      <Card className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Cpu className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">مدل فعلی</div>
            <div className="mt-0.5 font-mono text-xs text-muted-foreground" dir="ltr">
              {settings.llm.model}
            </div>
          </div>
          <Badge variant={settings.llm.model.includes(':free') ? 'secondary' : 'default'}>
            {settings.llm.model.includes(':free') ? 'رایگان' : 'پولی'}
          </Badge>
        </div>
      </Card>

      {/* Model Selection */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">مدلهای موجود</h2>
        <div className="grid gap-3">
          {models.map((model) => (
            <ModelCard
              key={model.id}
              model={model}
              selected={selectedModel === model.id}
              onSelect={() => setSelectedModel(model.id)}
              onTest={() => handleTest(model.id)}
              testing={testing === model.id}
            />
          ))}
        </div>
      </div>

      {/* Parameters */}
      <Card className="space-y-4 p-5">
        <h2 className="text-lg font-semibold">پارامترها</h2>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">دما (Temperature)</label>
            <span className="font-mono text-xs text-muted-foreground">
              {temperature.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={2}
            step={0.05}
            value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>دقیق (0)</span>
            <span>متعادل (1)</span>
            <span>خلاق (2)</span>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <label className="text-sm font-medium">حداکثر توکن</label>
          <Input
            type="number"
            min={100}
            max={32000}
            value={maxTokens}
            onChange={(e) => setMaxTokens(Number(e.target.value))}
            dir="ltr"
            className="font-mono"
          />
          <p className="text-[10px] text-muted-foreground">
            حداکثر توکن برای پاسخ. مقادیر بیشتر = پاسخ طولانیتر ولی کندتر
          </p>
        </div>
      </Card>

      {/* Test Result */}
      {testResult && (
        <Card
          className={cn(
            'p-4',
            testResult.ok
              ? 'border-emerald-500/50 bg-emerald-500/5'
              : 'border-destructive/50 bg-destructive/5'
          )}
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            <TestTube className="h-4 w-4" />
            نتیجه تست
          </div>
          <div className="mt-3 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">مدل:</span>
              <span className="font-mono" dir="ltr">{testResult.model}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">وضعیت:</span>
              <Badge variant={testResult.ok ? 'default' : 'destructive'}>
                {testResult.ok ? 'موفق' : 'خطا'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">زمان پاسخ:</span>
              <span className="font-mono" dir="ltr">
                {testResult.latencyMs}ms
              </span>
            </div>
            {testResult.ok && testResult.response && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">پاسخ:</span>
                <span className="font-mono text-left" dir="ltr">
                  "{testResult.response}"
                </span>
              </div>
            )}
            {!testResult.ok && testResult.error && (
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">خطا:</span>
                <span className="text-destructive" dir="ltr">
                  {testResult.error}
                </span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Save */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => {
            setSelectedModel(settings.llm.model);
            setTemperature(settings.llm.temperature);
            setMaxTokens(settings.llm.maxTokens);
          }}
        >
          بازگردانی
        </Button>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          ذخیره
        </Button>
      </div>
    </div>
  );
}

function ModelCard({
  model,
  selected,
  onSelect,
  onTest,
  testing,
}: {
  model: LLMModel;
  selected: boolean;
  onSelect: () => void;
  onTest: () => void;
  testing: boolean;
}) {
  return (
    <Card
      className={cn(
        'cursor-pointer p-4 transition-all',
        selected ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/50'
      )}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
            selected ? 'border-primary bg-primary' : 'border-muted-foreground/30'
          )}
        >
          {selected && <Check className="h-3 w-3 text-primary-foreground" />}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{model.name}</span>
                {model.free ? (
                  <Badge variant="secondary" className="gap-1">
                    <Sparkles className="h-3 w-3" />
                    رایگان
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1">
                    <Coins className="h-3 w-3" />
                    پولی
                  </Badge>
                )}
                {model.toolCalling && (
                  <Badge variant="outline" className="gap-1">
                    <Zap className="h-3 w-3" />
                    Tools
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {model.description}
              </p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onTest();
              }}
              disabled={testing}
              className="shrink-0 gap-1.5"
            >
              {testing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <TestTube className="h-3.5 w-3.5" />
              )}
              تست
            </Button>
          </div>

          <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Cpu className="h-3 w-3" />
              Context: {formatNumber(model.context)}
            </span>
            {!model.free && (
              <>
                <span className="flex items-center gap-1">
                  <Coins className="h-3 w-3" />
                  ورودی: ${model.pricing.input}/M
                </span>
                <span className="flex items-center gap-1">
                  <Coins className="h-3 w-3" />
                  خروجی: ${model.pricing.output}/M
                </span>
              </>
            )}
            <span className="flex items-center gap-1">
              <Timer className="h-3 w-3" />
              {model.provider}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}