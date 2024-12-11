import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from './ui/Button';
import { useThoughtStore } from '../store/useThoughtStore';

export function ThoughtInput() {
  const [input, setInput] = useState('');
  const addThought = useThoughtStore((state) => state.addThought);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      addThought(input.trim());
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Share your thoughts and ideas..."
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button type="submit" disabled={!input.trim()}>
          <Send className="w-4 h-4 mr-2" />
          Add
        </Button>
      </div>
    </form>
  );
}