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
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Thought {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  sectionId: string;
  status: 'pending' | 'analyzing' | 'completed' | 'error';
  aiAnalysis?: ThoughtAnalysis;
  ranking?: number;
  chatHistory?: ChatMessage[];
}

export interface ThoughtAnalysis {
  steps: {
    stepId: string;
    content: string;
  }[];
}

export interface ThoughtCluster {
  id: string;
  thoughts: Thought[];
  name: string;
  ranking: {
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