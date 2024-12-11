export interface AIResponse {
  enhancement: string;
  marketResearch: string;
  businessCase: string;
  ranking: {
    marketImpact: number;
    viability: number;
  };
}

export interface ChatMessage {
  id: string;  // Unique identifier for the message
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;  // Timestamp of the message
}

export interface Thought {
  id: string;
  content: string;
  createdAt: Date;
  aiAnalysis: AIResponse | null;
  status: 'idle' | 'loading' | 'error' | 'success';
  error?: string;
  ranking: {
    marketImpact: number;
    viability: number;
    totalScore: number;
  };
  chatHistory?: ChatMessage[];  // Add chat history to the Thought interface
}

export interface ThoughtCluster {
  id: string;
  name: string;
  thoughts: string[];
  summary: string;
  ranking: {
    averageMarketImpact: number;
    averageViability: number;
    totalScore: number;
  };
}

export type SortOption = 'date' | 'marketImpact' | 'viability' | 'totalScore';

export interface ThoughtChatContext {
  thoughtContent: string;
  enhancement?: string;
  marketResearch?: string;
  businessCase?: string;
  ranking?: {
    marketImpact: number;
    viability: number;
  };
}