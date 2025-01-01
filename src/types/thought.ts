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

export interface WorkflowResponse {
  stepId: string;
  content: string;
}

export interface ThoughtAnalysis {
  steps: WorkflowResponse[];
  status: 'pending' | 'completed' | 'error';
  error?: string;
}

export interface Thought {
  id: string;
  content: string;
  sectionId: string;
  aiAnalysis: ThoughtAnalysis | null;
  createdAt: number;
  status: 'pending' | 'completed' | 'error';
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