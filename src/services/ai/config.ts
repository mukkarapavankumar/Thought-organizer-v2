export type AIProvider = 'ollama' | 'openai' | 'perplexity';

export interface AIConfig {
  name: string;
  baseUrl?: string;
  apiKey?: string;
  model?: string;
}

export const AI_CONFIGS: Record<AIProvider, AIConfig> = {
  ollama: {
    name: 'Ollama',
    baseUrl: 'http://localhost:11434',
    model: 'llama2',
  },
  openai: {
    name: 'OpenAI',
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    model: 'gpt-3.5-turbo',
  },
  perplexity: {
    name: 'Perplexity',
    apiKey: import.meta.env.VITE_PERPLEXITY_API_KEY,
    model: 'llama-3.1-sonar-small-128k-online',
  },
};

export const DEFAULT_PROVIDER: AIProvider = 'ollama';
