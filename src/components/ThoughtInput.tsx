import React, { useState } from 'react';
import { useThoughtStore } from '../store/useThoughtStore';

interface ThoughtInputProps {
  sectionId: string;
}

export function ThoughtInput({ sectionId }: ThoughtInputProps) {
  const [content, setContent] = useState('');
  const addThought = useThoughtStore((state) => state.addThought);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    await addThought(content, sectionId);
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter your thought..."
          className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!content.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add Thought
        </button>
      </div>
    </form>
  );
}