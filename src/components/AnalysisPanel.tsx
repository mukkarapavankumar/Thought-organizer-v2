import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Trash2, X, Minimize2, Maximize2, MessageSquare } from 'lucide-react';
import { AIResponse, ChatMessage, ThoughtChatContext } from '../types/thought';
import { generateChatCompletion } from '../services/ai/openai';
import { useThoughtStore } from '../store/useThoughtStore';

interface AnalysisPanelProps {
  aiResponse: AIResponse | null;
  thoughtContent: string;
  thoughtId: string;
}

export function AnalysisPanel({ aiResponse, thoughtContent, thoughtId }: AnalysisPanelProps) {
  const [chatMessage, setChatMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatDisplayMode, setChatDisplayMode] = useState<'small' | 'maximized' | 'closed'>('closed');
  
  // Use the store to get and update chat history
  const { addChatMessage, clearThoughtChatHistory } = useThoughtStore();
  const chatHistory = useThoughtStore(state => 
    state.thoughts.find(t => t.id === thoughtId)?.chatHistory || []
  );

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;

    // Create a new user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: chatMessage,
      id: `user-${Date.now()}`,
      timestamp: Date.now()
    };

    // Add user message to store
    addChatMessage(thoughtId, userMessage);
    setChatMessage('');
    setIsLoading(true);

    // Prepare context from AI analysis
    const context: ThoughtChatContext = {
      thoughtContent,
      enhancement: aiResponse?.enhancement,
      marketResearch: aiResponse?.marketResearch,
      businessCase: aiResponse?.businessCase,
      ranking: aiResponse?.ranking
    };

    try {
      // Generate AI response with context
      const response = await generateChatCompletion(
        chatHistory, 
        context
      );

      // Create assistant message
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        id: `assistant-${Date.now()}`,
        timestamp: Date.now()
      };

      // Add assistant message to store
      addChatMessage(thoughtId, assistantMessage);
    } catch (error) {
      console.error('Error in chat:', error);
      addChatMessage(thoughtId, {
        role: 'assistant',
        content: 'Sorry, I encountered an error.',
        id: `error-${Date.now()}`,
        timestamp: Date.now()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendChatMessage = async () => {
    if (!chatMessage.trim()) return;
    
    setIsLoading(true);
    try {
      await addChatMessage(thoughtId, {
        content: chatMessage,
        role: 'user'
      });

      // Generate AI response
      await handleSendMessage();
    } catch (error) {
      console.error('Error sending chat message:', error);
    } finally {
      setIsLoading(false);
      setChatMessage('');
    }
  };

  const handleClearChatHistory = () => {
    clearThoughtChatHistory(thoughtId);
  };

  return (
    <div className="flex h-full">
      {/* Analysis panel - full width when chat is small, reduced when maximized */}
      <div 
        className={`
          flex-1 transition-all duration-300 
          ${chatDisplayMode === 'maximized' 
            ? 'w-1/4 opacity-50 pointer-events-none' 
            : 'w-full'
          }
        `}
      >
        {/* Existing analysis sections */}
        {aiResponse ? (
          <div className="p-4 space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Enhancement Suggestions</h3>
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{aiResponse.enhancement}</ReactMarkdown>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Market Research</h3>
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{aiResponse.marketResearch}</ReactMarkdown>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Business Case</h3>
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{aiResponse.businessCase}</ReactMarkdown>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 p-4 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-blue-700">Market Impact</div>
                <div className="text-2xl font-bold text-blue-900">
                  {aiResponse.ranking.marketImpact}/10
                </div>
              </div>

              <div className="flex-1 p-4 bg-green-50 rounded-lg">
                <div className="text-sm font-medium text-green-700">Viability</div>
                <div className="text-2xl font-bold text-green-900">
                  {aiResponse.ranking.viability}/10
                </div>
              </div>
            </div>
            {chatDisplayMode === 'closed' && (
              <button 
                onClick={() => setChatDisplayMode('small')}
                className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
                title="Open Thought Chat"
              >
                <MessageSquare size={24} />
              </button>
            )}
          </div>
        ) : null}
      </div>

      {/* Chat Section - Only render when not closed */}
      {chatDisplayMode !== 'closed' && (
        <div 
          className={`
            fixed right-4 bottom-4 z-50 transition-all duration-300 
            bg-white shadow-lg rounded-lg border border-gray-200
            ${chatDisplayMode === 'small' 
              ? 'w-[400px] h-[700px]' 
              : 'inset-10 w-[calc(100%-80px)] h-[calc(100%-80px)]'
            }
          `}
        >
          <div className="bg-gray-100 p-3 flex justify-between items-center rounded-t-lg">
            <h3 className="text-lg font-semibold truncate">Thought Chat</h3>
            <div className="flex items-center space-x-2">
              {chatHistory.length > 0 && (
                <button 
                  onClick={handleClearChatHistory}
                  className="text-red-500 hover:text-red-700"
                  title="Clear chat history"
                >
                  <Trash2 size={20} />
                </button>
              )}
              <button 
                onClick={() => setChatDisplayMode(
                  chatDisplayMode === 'small' ? 'maximized' : 
                  chatDisplayMode === 'maximized' ? 'closed' : 
                  'closed'
                )}
                className="text-gray-500 hover:text-gray-700"
                title={
                  chatDisplayMode === 'small' ? "Maximize chat" : 
                  chatDisplayMode === 'maximized' ? "Close chat" : 
                  "Open chat"
                }
              >
                {chatDisplayMode === 'small' ? (
                  <Maximize2 size={20} />
                ) : chatDisplayMode === 'maximized' ? (
                  <X size={20} />
                ) : null}
              </button>
            </div>
          </div>
          
          {/* Chat content */}
          <div 
            className={`
              p-4 overflow-y-auto space-y-2
              ${chatDisplayMode === 'maximized' 
                ? 'max-h-[calc(100%-200px)]' 
                : 'max-h-[calc(100%-100px)]'
              }
            `}
          >
            {chatHistory.map((msg, index) => (
              <div 
                key={index} 
                className={`p-2 rounded-lg max-w-[80%] ${
                  msg.role === 'user' 
                    ? 'bg-blue-500 text-white self-end ml-auto' 
                    : 'bg-gray-200 text-black self-start mr-auto'
                }`}
              >
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            ))}
            {isLoading && (
              <div className="text-gray-500 italic">Thinking...</div>
            )}
          </div>
          
          {/* Chat input area */}
          <div className="p-3 border-t flex">
            <input 
              type="text" 
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendChatMessage()}
              placeholder="Ask a thought-related question..." 
              className="flex-grow p-2 border rounded-l-lg"
            />
            <button 
              onClick={handleSendChatMessage}
              disabled={!chatMessage.trim() || isLoading}
              className="bg-blue-500 text-white p-2 rounded-r-lg disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
