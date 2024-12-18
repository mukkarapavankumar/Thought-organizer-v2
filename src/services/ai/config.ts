export type AIProvider = 'openai' | 'perplexity' | 'ollama';

export interface AIConfig {
  baseURL: string;
  apiKey?: string;
  model: string;
  isLocal?: boolean;
}

export const AI_CONFIGS: Record<AIProvider, AIConfig> = {
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || undefined,
    baseURL: 'https://api.openai.com/v1',
    model: 'gpt-4o',
    isLocal: false
  },
  perplexity: {
    apiKey: import.meta.env.VITE_PERPLEXITY_API_KEY,
    baseURL: 'https://api.perplexity.ai',
    model: 'llama-3.1-sonar-large-128k-online',
    isLocal: false
  },
  ollama: {
    baseURL: 'http://localhost:11434',
    model: 'llama3.1:latest',
    isLocal: true
  }
};

export const DEFAULT_PROVIDER: AIProvider = 'ollama';
