import React from 'react';
import { ThoughtCard } from './ThoughtCard';
import { ChatPanel } from './ChatPanel';
import { SortControls } from './SortControls';
import { useThoughtStore } from '../store/useThoughtStore';
import { Thought } from '../types/thought';

interface ThoughtListProps {
  thoughts: Thought[];
  selectedThoughtId: string | null;
  onSelectThought: (id: string | null) => void;
}

export function ThoughtList({ thoughts, selectedThoughtId, onSelectThought }: ThoughtListProps) {
  const sortBy = useThoughtStore((state) => state.sortBy);
  const setSortBy = useThoughtStore((state) => state.setSortBy);
  const [chatThoughtId, setChatThoughtId] = React.useState<string | null>(null);

  const sortedThoughts = React.useMemo(() => {
    return [...thoughts].sort((a, b) => {
      try {
        switch (sortBy) {
          case 'date': {
            const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
            const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
            return dateB.getTime() - dateA.getTime();
          }
          case 'marketImpact':
            return (b.ranking?.marketImpact || 0) - (a.ranking?.marketImpact || 0);
          case 'viability':
            return (b.ranking?.viability || 0) - (a.ranking?.viability || 0);
          case 'totalScore':
            return (b.ranking?.totalScore || 0) - (a.ranking?.totalScore || 0);
          default:
            return 0;
        }
      } catch (error) {
        console.error('Error sorting thoughts:', error);
        return 0;
      }
    });
  }, [thoughts, sortBy]);

  const chatThought = chatThoughtId ? thoughts.find(t => t.id === chatThoughtId) : null;

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Thoughts</h2>
          <SortControls value={sortBy} onChange={setSortBy} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {sortedThoughts.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No thoughts yet. Add one to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedThoughts.map((thought) => (
              <ThoughtCard
                key={thought.id}
                thought={thought}
                isSelected={thought.id === selectedThoughtId}
                onClick={() => onSelectThought(thought.id)}
                onChatOpen={() => setChatThoughtId(thought.id)}
              />
            ))}
          </div>
        )}
      </div>

      {chatThought && (
        <ChatPanel
          thought={chatThought}
          onClose={() => setChatThoughtId(null)}
        />
      )}
    </div>
  );
}