import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { useThoughtStore } from '../store/useThoughtStore';
import { Thought, ChatMessage } from '../types/thought';
import { generateCompletion } from '../services/ai/openai';
import ReactMarkdown from 'react-markdown';
import { CopyOutlined, SnippetsOutlined } from '@ant-design/icons';
import { message as antMessage } from 'antd';

interface ChatPanelProps {
  thought: Thought;
  onClose: () => void;
}

interface CodeProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function ChatPanel({ thought, onClose }: ChatPanelProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addChatMessage, clearThoughtChatHistory } = useThoughtStore();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      antMessage.success('Copied to clipboard');
    } catch (err) {
      antMessage.error('Failed to copy');
    }
  };

  const extractCode = (markdown: string): string => {
    const codeBlocks = markdown.match(/```[\s\S]*?```/g) || [];
    return codeBlocks.map(block => block.replace(/```[\w]*\n?|\n?```/g, '')).join('\n\n');
  };

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
${thought.chatHistory?.map((msg: ChatMessage) => `${msg.role}: ${msg.content}`).join('\n') || ''}

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[80%] h-[80%] flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold">Chat about this thought</h3>
            <span className="text-sm text-gray-500">({thought.content.slice(0, 50)}...)</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {thought.chatHistory?.map((msg: ChatMessage) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`p-4 rounded-lg max-w-[70%] ${
                  msg.role === 'user'
                    ? 'bg-blue-100 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="prose prose-lg max-w-none dark:prose-invert">
                  {msg.role === 'assistant' && msg.content.includes('```') && (
                    <div className="flex justify-end gap-2 mb-2">
                      <button
                        onClick={() => copyToClipboard(extractCode(msg.content))}
                        className="p-1 hover:bg-gray-200 rounded-md text-gray-600 hover:text-gray-900"
                        title="Copy code blocks"
                      >
                        <SnippetsOutlined />
                      </button>
                      <button
                        onClick={() => copyToClipboard(msg.content)}
                        className="p-1 hover:bg-gray-200 rounded-md text-gray-600 hover:text-gray-900"
                        title="Copy full content"
                      >
                        <CopyOutlined />
                      </button>
                    </div>
                  )}
                  <ReactMarkdown
                    components={{
                      pre: ({ ...props }) => (
                        <pre className="bg-gray-800 p-6 rounded-lg overflow-auto text-gray-100 my-4" {...props} />
                      ),
                      code: ({ inline, className, ...props }: CodeProps) =>
                        inline ? (
                          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-800" {...props} />
                        ) : (
                          <code className="text-gray-400" {...props} />
                        ),
                      blockquote: ({ ...props }) => (
                        <blockquote className="border-l-4 border-gray-200 pl-4 italic my-4" {...props} />
                      ),
                      a: ({ ...props }) => (
                        <a className="text-blue-600 hover:underline" {...props} />
                      ),
                      ul: ({ ...props }) => (
                        <ul className="list-disc list-inside my-4 space-y-2" {...props} />
                      ),
                      ol: ({ ...props }) => (
                        <ol className="list-decimal list-inside my-4 space-y-2" {...props} />
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-500 p-4 rounded-lg italic">
                Thinking...
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 border-t">
          <div className="flex gap-4">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about this thought..."
              className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
            />
            <button
              type="submit"
              disabled={!message.trim() || isLoading}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-lg font-medium"
            >
              <Send className="w-5 h-5" />
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 