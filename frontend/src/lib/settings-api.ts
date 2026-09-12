// src/lib/settings-api.ts
import { api, ApiResponse } from './api';

export interface LLMModel {
  id: string;
  name: string;
  provider: string;
  context: number;
  pricing: { input: number; output: number };
  free: boolean;
  toolCalling: boolean;
  description: string;
}

export interface UserSettings {
  _id: string;
  user: string;
  llm: {
    model: string;
    temperature: number;
    maxTokens: number;
  };
  preferences: {
    language: 'fa' | 'en';
    theme: 'light' | 'dark' | 'system';
  };
}

export interface ModelsResponse {
  models: LLMModel[];
  default: string;
}

export interface TestModelResult {
  model: string;
  ok: boolean;
  response?: string;
  error?: string;
  latencyMs: number;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function getSettings(): Promise<UserSettings> {
  const { data } = await api.get<ApiResponse<UserSettings>>('/settings');
  return data.data;
}

export async function updateSettings(
  updates: Partial<Pick<UserSettings, 'llm' | 'preferences'>>
): Promise<UserSettings> {
  const { data } = await api.patch<ApiResponse<UserSettings>>(
    '/settings',
    updates
  );
  return data.data;
}

export async function listModels(): Promise<ModelsResponse> {
  const { data } = await api.get<ApiResponse<ModelsResponse>>(
    '/settings/models'
  );
  return data.data;
}

export async function testModel(model: string): Promise<TestModelResult> {
  const { data } = await api.post<ApiResponse<TestModelResult>>(
    '/settings/models/test',
    { model }
  );
  return data.data;
}