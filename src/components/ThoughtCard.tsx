import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { RefreshCw, Edit2, Trash2, MessageSquare } from 'lucide-react';
import { Thought } from '../types/thought';
import { useThoughtStore } from '../store/useThoughtStore';

interface ThoughtCardProps {
  thought: Thought;
  isSelected: boolean;
  onClick: () => void;
  onChatOpen?: () => void;
}

export function ThoughtCard({ thought, isSelected, onClick, onChatOpen }: ThoughtCardProps) {
  const { retryAnalysis, editThought, deleteThought } = useThoughtStore();
  const [isEditing, setIsEditing] = React.useState(false);
  const [editContent, setEditContent] = React.useState(thought.content);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditContent(thought.content);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (editContent.trim() !== thought.content) {
      await editThought(thought.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
    setEditContent(thought.content);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this thought?')) {
      deleteThought(thought.id);
    }
  };

  const handleRetry = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await retryAnalysis(thought.id);
  };

  const handleChatClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChatOpen?.();
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg border cursor-pointer transition-all ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
      }`}
    >
      {isEditing ? (
        <form onSubmit={handleSaveEdit} onClick={(e) => e.stopPropagation()}>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full p-2 border rounded-md mb-2"
            rows={3}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </form>
      ) : (
        <>
          <p className="text-gray-900">{thought.content}</p>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-gray-500">
              {formatDistanceToNow(thought.createdAt, { addSuffix: true })}
            </span>
            <div className="flex items-center gap-2">
              {thought.status === 'loading' && (
                <span className="text-blue-500">Analyzing...</span>
              )}
              {thought.status === 'error' && (
                <span className="text-red-500">Analysis failed</span>
              )}
              <button
                onClick={handleRetry}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                title="Retry analysis"
              >
                <RefreshCw className="w-4 h-4 text-gray-500" />
              </button>
              <button
                onClick={handleEdit}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                title="Edit thought"
              >
                <Edit2 className="w-4 h-4 text-gray-500" />
              </button>
              <button
                onClick={handleDelete}
                className="p-1 hover:bg-red-100 rounded-full transition-colors"
                title="Delete thought"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
              <button
                onClick={handleChatClick}
                className="p-1 hover:bg-blue-100 rounded-full transition-colors"
                title="Chat about this thought"
              >
                <MessageSquare className="w-4 h-4 text-blue-500" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}