import { create } from 'zustand';
import { AIProvider } from './services/ai/config';

export interface Thought {
  id: string;
  content: string;
  sectionId: string;
  aiAnalysis: string | null;
  createdAt: number;
}

export interface WorkflowStep {
  id: string;
  name: string;
  prompt: string;
  contextSteps: string[];
  model?: string;
}

export interface Section {
  id: string;
  name: string;
  workflow: WorkflowStep[];
}

interface ApiKeys {
  openAiKey: string;
  perplexityKey: string;
}

interface Store {
  // Thoughts
  thoughts: Thought[];
  selectedThoughtId: string | null;
  setSelectedThoughtId: (id: string | null) => void;
  
  // Sections
  sections: Section[];
  currentSectionId: string | null;
  currentSection: Section | null;
  
  // AI Provider
  provider: AIProvider;
  setProvider: (provider: AIProvider) => void;
  selectedOllamaModel: string;
  setSelectedOllamaModel: (model: string) => void;
  setOllamaModel: (model: string) => void;
  ollamaModels: string[];
  isLoadingModels: boolean;
  
  // API Keys
  apiKeys: ApiKeys;
  loadApiKeys: () => Promise<void>;
  saveApiKeys: (keys: ApiKeys) => Promise<void>;
}

export const useStore = create<Store>((set, get) => ({
  // Thoughts
  thoughts: [],
  selectedThoughtId: null,
  setSelectedThoughtId: (id) => set({ selectedThoughtId: id }),
  
  // Sections
  sections: [],
  currentSectionId: null,
  currentSection: null,
  
  // AI Provider
  provider: 'ollama',
  setProvider: (provider) => set({ provider }),
  selectedOllamaModel: 'llama2',
  setSelectedOllamaModel: (model) => set({ selectedOllamaModel: model }),
  setOllamaModel: (model) => set({ selectedOllamaModel: model }),
  ollamaModels: [],
  isLoadingModels: false,
  
  // API Keys
  apiKeys: {
    openAiKey: '',
    perplexityKey: '',
  },
  loadApiKeys: async () => {
    try {
      const response = await fetch('http://localhost:3001/api/keys');
      const keys = await response.json();
      set({ apiKeys: keys });
    } catch (error) {
      console.error('Failed to load API keys:', error);
    }
  },
  saveApiKeys: async (keys: ApiKeys) => {
    try {
      await fetch('http://localhost:3001/api/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(keys),
      });
      set({ apiKeys: keys });
    } catch (error) {
      console.error('Failed to save API keys:', error);
      throw error;
    }
  },
}));