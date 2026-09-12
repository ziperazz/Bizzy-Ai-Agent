// src/store/settings.store.ts
import { create } from 'zustand';
import * as settingsApi from '@/lib/settings-api';
import type { UserSettings, LLMModel } from '@/lib/settings-api';

interface SettingsState {
  settings: UserSettings | null;
  models: LLMModel[];
  defaultModel: string;
  loading: boolean;
  saving: boolean;

  fetchSettings: () => Promise<void>;
  fetchModels: () => Promise<void>;
  updateSettings: (updates: Partial<Pick<UserSettings, 'llm' | 'preferences'>>) => Promise<void>;
  reset: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  models: [],
  defaultModel: '',
  loading: false,
  saving: false,

  fetchSettings: async () => {
    set({ loading: true });
    try {
      const settings = await settingsApi.getSettings();
      set({ settings });
    } finally {
      set({ loading: false });
    }
  },

  fetchModels: async () => {
    const res = await settingsApi.listModels();
    set({ models: res.models, defaultModel: res.default });
  },

  updateSettings: async (updates) => {
    set({ saving: true });
    try {
      const settings = await settingsApi.updateSettings(updates);
      set({ settings });
    } finally {
      set({ saving: false });
    }
  },

  reset: () => set({ settings: null, models: [], loading: false, saving: false }),
}));