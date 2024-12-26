import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { useThoughtStore } from '../store/useThoughtStore';
import { Thought } from '../types/thought';
import { generateCompletion } from '../services/ai/openai';

interface ChatPanelProps {
  thought: Thought;
  onClose: () => void;
}

export function ChatPanel({ thought, onClose }: ChatPanelProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addChatMessage, clearThoughtChatHistory } = useThoughtStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    // Add user message
    addChatMessage(thought.id, thought.sectionId, {
      role: 'user',
      content: message,
    });

    setIsLoading(true);
    setMessage('');

    try {
      // Create context from thought and analysis
      const context = `
Thought: ${thought.content}

Analysis Steps:
${thought.aiAnalysis?.steps.map(step => `${step.stepId}: ${step.content}`).join('\n\n')}

Previous Chat History:
${thought.chatHistory?.map(msg => `${msg.role}: ${msg.content}`).join('\n') || ''}

User's Question: ${message}
`;

      const response = await generateCompletion(context);

      // Add AI response
      addChatMessage(thought.id, thought.sectionId, {
        role: 'assistant',
        content: response,
      });
    } catch (error) {
      console.error('Chat error:', error);
      addChatMessage(thought.id, thought.sectionId, {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed right-0 top-0 w-[400px] h-screen bg-white shadow-xl border-l border-gray-200 flex flex-col z-50">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-medium">Chat about this thought</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {thought.chatHistory?.map((msg) => (
          <div
            key={msg.id}
            className={`p-3 rounded-lg max-w-[80%] ${
              msg.role === 'user'
                ? 'bg-blue-500 text-white ml-auto'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            {msg.content}
          </div>
        ))}
        {isLoading && (
          <div className="text-sm text-gray-500 italic">Thinking...</div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask about this thought..."
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!message.trim() || isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
} 