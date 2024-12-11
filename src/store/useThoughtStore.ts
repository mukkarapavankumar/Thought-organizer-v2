import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Thought, ThoughtCluster, SortOption, ChatMessage } from '../types/thought';
import { analyzeThought } from '../services/ai/openai';
import { clusterThoughts } from '../services/ai/clustering';
import { v4 as uuidv4 } from 'uuid';

interface ThoughtStore {
  thoughts: Thought[];
  clusters: ThoughtCluster[];
  sortBy: SortOption;
  addThought: (content: string) => Promise<void>;
  deleteThought: (id: string) => void;
  retryAnalysis: (id: string) => Promise<void>;
  editThought: (id: string, newContent: string) => Promise<void>;
  updateThoughtAnalysis: (id: string, enhancement: string, marketResearch: string, businessCase: string, ranking?: { marketImpact: number, viability: number }) => void;
  updateClusters: () => Promise<void>;
  setSortBy: (option: SortOption) => void;
  getSortedThoughts: () => Thought[];
  getSortedClusters: () => ThoughtCluster[];
  analyzeThought: (thoughtId: string) => Promise<void>;
  addChatMessage: (thoughtId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearThoughtChatHistory: (thoughtId: string) => void;
}

export const useThoughtStore = create<ThoughtStore>()(
  persist(
    (set, get) => ({
      thoughts: [],
      clusters: [],
      sortBy: 'date',

      addThought: async (content: string) => {
        const thought: Thought = {
          id: crypto.randomUUID(),
          content,
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
          const currentState = get();
          await fetch('http://localhost:3001/api/thoughts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ thoughts: currentState.thoughts }),
          });
        } catch (error) {
          console.error('Failed to save thoughts:', error);
        }

        try {
          const analysis = await analyzeThought(content);
          set((state) => ({
            thoughts: state.thoughts.map((t) =>
              t.id === thought.id
                ? {
                    ...t,
                    aiAnalysis: analysis,
                    status: 'success',
                    ranking: {
                      marketImpact: analysis.ranking.marketImpact,
                      viability: analysis.ranking.viability,
                      totalScore: (analysis.ranking.marketImpact + analysis.ranking.viability) / 2,
                    },
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
              return b.createdAt.getTime() - a.createdAt.getTime();
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

      getSortedClusters: () => {
        const { clusters } = get();
        return [...clusters].sort((a, b) => b.ranking.totalScore - a.ranking.totalScore);
      },

      updateThoughtAnalysis: (id: string, enhancement: string, marketResearch: string, businessCase: string, ranking?: { marketImpact: number, viability: number }) => {
        set((state) => ({
          thoughts: state.thoughts.map((thought) =>
            thought.id === id
              ? {
                  ...thought,
                  aiAnalysis: {
                    enhancement,
                    marketResearch,
                    businessCase,
                    ranking: ranking || { marketImpact: 5, viability: 5 }
                  },
                  ranking: {
                    marketImpact: ranking?.marketImpact || 5,
                    viability: ranking?.viability || 5,
                    totalScore: (ranking?.marketImpact || 5) + (ranking?.viability || 5)
                  }
                }
              : thought
          ),
        }));
      },

      updateClusters: async () => {
        const { thoughts } = get();
        const clusters = await clusterThoughts(thoughts);
        set({ clusters });
      },

      analyzeThought: async (thoughtId: string) => {
        const thought = get().thoughts.find((t) => t.id === thoughtId);
        if (!thought) return;

        try {
          set((state) => ({
            thoughts: state.thoughts.map((t) =>
              t.id === thoughtId ? { ...t, status: 'loading' } : t
            ),
          }));

          const aiResponse = await analyzeThought(thought.content);

          get().updateThoughtAnalysis(
            thoughtId, 
            aiResponse.enhancement, 
            aiResponse.marketResearch, 
            aiResponse.businessCase,
            {
              marketImpact: aiResponse.ranking.marketImpact,
              viability: aiResponse.ranking.viability
            }
          );

          set((state) => ({
            thoughts: state.thoughts.map((t) =>
              t.id === thoughtId
                ? {
                    ...t,
                    status: 'success',
                    ranking: {
                      marketImpact: aiResponse.ranking.marketImpact,
                      viability: aiResponse.ranking.viability,
                      totalScore: aiResponse.ranking.marketImpact + aiResponse.ranking.viability,
                    },
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
          )
        }));
      },
    }),
    {
      name: 'thought-store',
      storage: {
        getItem: async (name) => {
          try {
            const response = await fetch('http://localhost:3001/api/thoughts');
            const data = await response.json();
            console.log('Retrieved thoughts:', data); // Debug log
            
            // Return a proper StorageValue object
            return {
              state: {
                thoughts: data || [],
                sortBy: 'date',
                clusters: [],
                // Add other default/initial state properties as needed
              }
            };
          } catch (error) {
            console.error('Error retrieving thoughts:', error);
            return null; // Return null if fetch fails
          }
        },
        setItem: async (name, value) => {
          try {
            console.log('Received value for setItem:', value); // Debug log
            
            // Safely parse the value
            let parsedValue;
            try {
              // If it's already an object, use it directly
              parsedValue = typeof value === 'string' 
                ? JSON.parse(value) 
                : value;
            } catch (parseError) {
              console.error('Failed to parse storage value:', parseError);
              console.error('Problematic value:', value);
              return;
            }

            // Ensure we have a valid state object
            const state = parsedValue.state || parsedValue;
            
            // Validate thoughts
            if (!state.thoughts || !Array.isArray(state.thoughts)) {
              console.error('Invalid thoughts data:', state.thoughts);
              return;
            }

            await fetch('http://localhost:3001/api/thoughts', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                thoughts: state.thoughts.map((t: Thought) => ({
                  ...t,
                  createdAt: t.createdAt instanceof Date 
                    ? t.createdAt.toISOString() 
                    : (typeof t.createdAt === 'string' 
                      ? t.createdAt 
                      : new Date(t.createdAt).toISOString())
                }))
              }),
            });
          } catch (error) {
            console.error('Failed to save thoughts:', error);
          }
        },
        removeItem: (name) => {
          // Optional: implement if you want to clear all thoughts
          return Promise.resolve();
        }
      }
    }
  )
);