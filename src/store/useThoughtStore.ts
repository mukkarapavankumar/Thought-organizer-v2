import { create } from 'zustand';
import { Thought, SortOption, ChatMessage } from '../types/thought';
import { analyzeThoughtWithWorkflow } from '../services/ai/openai';
import { v4 as uuidv4 } from 'uuid';
import { useSectionStore } from './useSectionStore';
import { storage } from '../services/storage';

interface ThoughtStore {
  thoughts: Record<string, Thought[]>;
  sortBy: SortOption;
  addThought: (content: string, sectionId: string) => Promise<void>;
  deleteThought: (id: string, sectionId: string) => Promise<void>;
  retryAnalysis: (id: string, sectionId: string) => Promise<void>;
  editThought: (id: string, sectionId: string, newContent: string) => Promise<void>;
  setSortBy: (option: SortOption) => void;
  getSortedThoughts: (sectionId: string) => Thought[];
  analyzeThought: (thoughtId: string, sectionId: string) => Promise<void>;
  addChatMessage: (thoughtId: string, sectionId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => Promise<void>;
  clearThoughtChatHistory: (thoughtId: string, sectionId: string) => Promise<void>;
  loadThoughts: (sectionId: string) => Promise<void>;
}

export const useThoughtStore = create<ThoughtStore>()((set, get) => ({
  thoughts: {},
  sortBy: 'date',

  addThought: async (content: string, sectionId: string) => {
    const section = useSectionStore.getState().getSection(sectionId);
    if (!section) {
      throw new Error('Section not found');
    }

    const thought: Thought = {
      id: crypto.randomUUID(),
      content,
      sectionId,
      createdAt: new Date(),
      status: 'pending',
      aiAnalysis: undefined,
      ranking: undefined,
      chatHistory: [],
    };

    set((state) => ({
      thoughts: {
        ...state.thoughts,
        [sectionId]: [...(state.thoughts[sectionId] || []), thought],
      },
    }));

    await storage.saveThoughts(sectionId, get().thoughts[sectionId] || []);

    try {
      const analysis = await analyzeThoughtWithWorkflow(content, section.workflow);
      set((state) => ({
        thoughts: {
          ...state.thoughts,
          [sectionId]: state.thoughts[sectionId].map((t) =>
            t.id === thought.id
              ? {
                  ...t,
                  aiAnalysis: analysis,
                  status: 'completed',
                }
              : t
          ),
        },
      }));
      await storage.saveThoughts(sectionId, get().thoughts[sectionId] || []);
    } catch (error) {
      set((state) => ({
        thoughts: {
          ...state.thoughts,
          [sectionId]: state.thoughts[sectionId].map((t) =>
            t.id === thought.id
              ? {
                  ...t,
                  status: 'error',
                }
              : t
          ),
        },
      }));
      await storage.saveThoughts(sectionId, get().thoughts[sectionId] || []);
    }
  },

  retryAnalysis: async (thoughtId: string, sectionId: string) => {
    set((state) => ({
      thoughts: {
        ...state.thoughts,
        [sectionId]: state.thoughts[sectionId].map((t) =>
          t.id === thoughtId ? { ...t, status: 'analyzing' } : t
        ),
      },
    }));
    await storage.saveThoughts(sectionId, get().thoughts[sectionId] || []);
    await get().analyzeThought(thoughtId, sectionId);
  },

  editThought: async (id: string, sectionId: string, newContent: string) => {
    set((state) => ({
      thoughts: {
        ...state.thoughts,
        [sectionId]: state.thoughts[sectionId].map((t) =>
          t.id === id ? { ...t, content: newContent, status: 'analyzing' } : t
        ),
      },
    }));
    await storage.saveThoughts(sectionId, get().thoughts[sectionId] || []);
    await get().analyzeThought(id, sectionId);
  },

  deleteThought: async (id: string, sectionId: string) => {
    set((state) => ({
      thoughts: {
        ...state.thoughts,
        [sectionId]: state.thoughts[sectionId].filter((t) => t.id !== id),
      },
    }));
    await storage.saveThoughts(sectionId, get().thoughts[sectionId] || []);
  },

  setSortBy: (option: SortOption) => set({ sortBy: option }),

  getSortedThoughts: (sectionId: string) => {
    const state = get();
    const sectionThoughts = state.thoughts[sectionId] || [];
    return [...sectionThoughts].sort((a, b) => {
      const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
      const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
      return bTime - aTime;
    });
  },

  analyzeThought: async (thoughtId: string, sectionId: string) => {
    const section = useSectionStore.getState().getSection(sectionId);
    if (!section) {
      throw new Error('Section not found');
    }

    const thought = get().thoughts[sectionId]?.find((t) => t.id === thoughtId);
    if (!thought) {
      throw new Error('Thought not found');
    }

    try {
      const analysis = await analyzeThoughtWithWorkflow(thought.content, section.workflow);
      set((state) => ({
        thoughts: {
          ...state.thoughts,
          [sectionId]: state.thoughts[sectionId].map((t) =>
            t.id === thoughtId
              ? {
                  ...t,
                  aiAnalysis: analysis,
                  status: 'completed',
                }
              : t
          ),
        },
      }));
      await storage.saveThoughts(sectionId, get().thoughts[sectionId] || []);
    } catch (error) {
      set((state) => ({
        thoughts: {
          ...state.thoughts,
          [sectionId]: state.thoughts[sectionId].map((t) =>
            t.id === thoughtId
              ? {
                  ...t,
                  status: 'error',
                }
              : t
          ),
        },
      }));
      await storage.saveThoughts(sectionId, get().thoughts[sectionId] || []);
    }
  },

  addChatMessage: async (thoughtId: string, sectionId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const chatMessage = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };

    set((state) => ({
      thoughts: {
        ...state.thoughts,
        [sectionId]: state.thoughts[sectionId].map((t) =>
          t.id === thoughtId
            ? {
                ...t,
                chatHistory: [...(t.chatHistory || []), chatMessage],
              }
            : t
        ),
      },
    }));
    await storage.saveThoughts(sectionId, get().thoughts[sectionId] || []);
  },

  clearThoughtChatHistory: async (thoughtId: string, sectionId: string) => {
    set((state) => ({
      thoughts: {
        ...state.thoughts,
        [sectionId]: state.thoughts[sectionId].map((t) =>
          t.id === thoughtId
            ? {
                ...t,
                chatHistory: [],
              }
            : t
        ),
      },
    }));
    await storage.saveThoughts(sectionId, get().thoughts[sectionId] || []);
  },

  loadThoughts: async (sectionId: string) => {
    try {
      const thoughts = await storage.loadThoughts(sectionId);
      set((state) => ({
        thoughts: {
          ...state.thoughts,
          [sectionId]: thoughts,
        },
      }));
    } catch (error) {
      console.error('Error loading thoughts:', error);
    }
  },
}));