// src/store/chat.store.ts
import { create } from 'zustand';
import type { Conversation, Message, AgentStep } from '@/lib/chat-api';

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Message[];
  liveSteps: AgentStep[];
  isStreaming: boolean;
  error: string | null;

  setConversations: (c: Conversation[]) => void;
  setActiveConversation: (id: string | null) => void;
  setMessages: (m: Message[]) => void;
  addMessage: (m: Message) => void;
  appendStep: (s: AgentStep) => void;
  clearSteps: () => void;
  setStreaming: (s: boolean) => void;
  setError: (e: string | null) => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  activeConversationId: null,
  messages: [],
  liveSteps: [],
  isStreaming: false,
  error: null,

  setConversations: (conversations) => set({ conversations }),
  setActiveConversation: (activeConversationId) =>
    set({ activeConversationId, liveSteps: [], error: null }),
  setMessages: (messages) => set({ messages }),
  addMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
  appendStep: (step) => set((s) => ({ liveSteps: [...s.liveSteps, step] })),
  clearSteps: () => set({ liveSteps: [] }),
  setStreaming: (isStreaming) => set({ isStreaming }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      activeConversationId: null,
      messages: [],
      liveSteps: [],
      isStreaming: false,
      error: null,
    }),
}));