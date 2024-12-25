import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Thought, SortOption, ChatMessage } from '../types/thought';
import { analyzeThoughtWithWorkflow } from '../services/ai/openai';
import { v4 as uuidv4 } from 'uuid';
import { useSectionStore } from './useSectionStore';

interface ThoughtStore {
  thoughts: Thought[];
  sortBy: SortOption;
  addThought: (content: string, sectionId: string) => Promise<void>;
  deleteThought: (id: string) => void;
  retryAnalysis: (id: string) => Promise<void>;
  editThought: (id: string, newContent: string) => Promise<void>;
  setSortBy: (option: SortOption) => void;
  getSortedThoughts: () => Thought[];
  analyzeThought: (thoughtId: string) => Promise<void>;
  addChatMessage: (thoughtId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearThoughtChatHistory: (thoughtId: string) => void;
}

export const useThoughtStore = create<ThoughtStore>()(
  persist(
    (set, get) => ({
      thoughts: [],
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
          status: 'loading',
          aiAnalysis: null,
          ranking: {
            marketImpact: 0,
            viability: 0,
            totalScore: 0,
          },
          chatHistory: []
        };

        set((state) => ({
          thoughts: [thought, ...state.thoughts],
        }));

        try {
          const analysis = await analyzeThoughtWithWorkflow(content, section.workflow);
          set((state) => ({
            thoughts: state.thoughts.map((t) =>
              t.id === thought.id
                ? {
                    ...t,
                    aiAnalysis: analysis,
                    status: 'success',
                  }
                : t
            ),
          }));
        } catch (error) {
          set((state) => ({
            thoughts: state.thoughts.map((t) =>
              t.id === thought.id
                ? {
                    ...t,
                    status: 'error',
                    error: error instanceof Error ? error.message : 'Failed to analyze thought',
                  }
                : t
            ),
          }));
        }
      },

      retryAnalysis: async (thoughtId: string) => {
        set((state) => ({
          thoughts: state.thoughts.map((t) =>
            t.id === thoughtId ? { ...t, status: 'loading' } : t
          ),
        }));
        get().analyzeThought(thoughtId);
      },

      editThought: async (thoughtId: string, newContent: string) => {
        set((state) => ({
          thoughts: state.thoughts.map((t) =>
            t.id === thoughtId ? { ...t, content: newContent, status: 'loading' } : t
          ),
        }));
        get().analyzeThought(thoughtId);
      },

      deleteThought: (thoughtId: string) => {
        set((state) => ({
          thoughts: state.thoughts.filter((t) => t.id !== thoughtId),
        }));
      },

      setSortBy: (option: SortOption) => set({ sortBy: option }),

      getSortedThoughts: () => {
        const { thoughts, sortBy } = get();
        return [...thoughts].sort((a, b) => {
          switch (sortBy) {
            case 'date':
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            case 'marketImpact':
              return (b.ranking?.marketImpact || 0) - (a.ranking?.marketImpact || 0);
            case 'viability':
              return (b.ranking?.viability || 0) - (a.ranking?.viability || 0);
            case 'totalScore':
              return (b.ranking?.totalScore || 0) - (a.ranking?.totalScore || 0);
            default:
              return 0;
          }
        });
      },

      analyzeThought: async (thoughtId: string) => {
        const thought = get().thoughts.find((t) => t.id === thoughtId);
        if (!thought) return;

        const section = useSectionStore.getState().getSection(thought.sectionId);
        if (!section) {
          throw new Error('Section not found');
        }

        try {
          set((state) => ({
            thoughts: state.thoughts.map((t) =>
              t.id === thoughtId ? { ...t, status: 'loading' } : t
            ),
          }));

          const analysis = await analyzeThoughtWithWorkflow(thought.content, section.workflow);

          set((state) => ({
            thoughts: state.thoughts.map((t) =>
              t.id === thoughtId
                ? {
                    ...t,
                    status: 'success',
                    aiAnalysis: analysis,
                  }
                : t
            ),
          }));
        } catch (error) {
          set((state) => ({
            thoughts: state.thoughts.map((t) =>
              t.id === thoughtId
                ? {
                    ...t,
                    status: 'error',
                    error: error instanceof Error ? error.message : 'Unknown error',
                  }
                : t
            ),
          }));
        }
      },

      addChatMessage: (thoughtId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
        set((state) => ({
          thoughts: state.thoughts.map((thought) => 
            thought.id === thoughtId 
              ? {
                  ...thought,
                  chatHistory: [
                    ...(thought.chatHistory || []),
                    {
                      id: uuidv4(),
                      timestamp: Date.now(),
                      ...message
                    }
                  ]
                }
              : thought
          )
        }));
      },

      clearThoughtChatHistory: (thoughtId: string) => {
        set((state) => ({
          thoughts: state.thoughts.map((thought) =>
            thought.id === thoughtId
              ? { ...thought, chatHistory: [] }
              : thought
          ),
        }));
      },
    }),
    {
      name: 'thought-storage',
      storage: createJSONStorage(() => localStorage, {
        reviver: (key, value) => {
          // Convert date strings back to Date objects
          if (key === 'createdAt' && typeof value === 'string') {
            return new Date(value);
          }
          return value;
        },
      }),
    }
  )
);