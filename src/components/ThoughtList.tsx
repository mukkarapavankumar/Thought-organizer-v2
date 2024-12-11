import React, { useState } from 'react';
import { useThoughtStore } from '../store/useThoughtStore';
import { formatDistanceToNow } from 'date-fns';
import { RefreshCw, Trash2, Edit2 } from 'lucide-react';

interface ThoughtListProps {
  onSelectThought: (thoughtId: string) => void;
  selectedThoughtId: string | null;
}

export function ThoughtList({ onSelectThought, selectedThoughtId }: ThoughtListProps) {
  const { thoughts, retryAnalysis, deleteThought, editThought } = useThoughtStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleEdit = (thoughtId: string, content: string) => {
    setEditingId(thoughtId);
    setEditContent(content);
  };

  const handleSaveEdit = (thoughtId: string) => {
    if (editContent.trim()) {
      editThought(thoughtId, editContent.trim());
      setEditingId(null);
      setEditContent('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-4 p-4">
        {thoughts.map((thought) => (
          <div
            key={thought.id}
            className={`p-6 bg-white rounded-lg shadow-sm hover:shadow transition-all ${
              thought.id === selectedThoughtId ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                {editingId === thought.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full p-2 border rounded-md"
                      rows={3}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(thought.id)}
                        className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div onClick={() => onSelectThought(thought.id)} className="cursor-pointer">
                    <p className="text-lg text-gray-900">{thought.content}</p>
                    <div className="mt-2 flex items-center gap-4">
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(thought.createdAt, { addSuffix: true })}
                      </span>
                      {thought.status === 'loading' && (
                        <span className="text-sm text-blue-500">Analyzing...</span>
                      )}
                      {thought.status === 'error' && (
                        <span className="text-sm text-red-500">Analysis failed</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {thought.status === 'success' && thought.ranking && (
                  <>
                    <div className="text-center px-3 py-1 bg-blue-50 rounded-full">
                      <div className="text-xs text-blue-600 font-medium">Impact</div>
                      <div className="text-sm font-semibold text-blue-700">
                        {thought.ranking.marketImpact}/10
                      </div>
                    </div>
                    <div className="text-center px-3 py-1 bg-green-50 rounded-full">
                      <div className="text-xs text-green-600 font-medium">Viability</div>
                      <div className="text-sm font-semibold text-green-700">
                        {thought.ranking.viability}/10
                      </div>
                    </div>
                  </>
                )}
                <div className="flex flex-col gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      retryAnalysis(thought.id);
                    }}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    title="Retry analysis"
                  >
                    <RefreshCw className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(thought.id, thought.content);
                    }}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    title="Edit thought"
                  >
                    <Edit2 className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Are you sure you want to delete this thought?')) {
                        deleteThought(thought.id);
                      }
                    }}
                    className="p-1 hover:bg-red-50 rounded-full transition-colors"
                    title="Delete thought"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {thoughts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">No thoughts yet. Share your first idea above!</p>
          </div>
        )}
      </div>
    </div>
  );
}