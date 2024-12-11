import React, { useState, useEffect } from 'react';
import { Lightbulb } from 'lucide-react';
import { ThoughtInput } from './components/ThoughtInput';
import { ThoughtList } from './components/ThoughtList';
import { AnalysisPanel } from './components/AnalysisPanel';
import { AIProvider, AI_CONFIGS } from './services/ai/config';
import { initializeAI, getCurrentProvider } from './services/ai/openai';
import { fetchOllamaModels } from './services/ai/ollama';
import { useThoughtStore } from './store/useThoughtStore';

function App() {
  const [provider, setProvider] = useState<AIProvider>(getCurrentProvider());
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [selectedOllamaModel, setSelectedOllamaModel] = useState<string>(AI_CONFIGS.ollama.model);
  const [selectedThoughtId, setSelectedThoughtId] = useState<string | null>(null);
  
  const thoughts = useThoughtStore((state) => state.thoughts);
  const selectedThought = thoughts.find(t => t.id === selectedThoughtId);

  useEffect(() => {
    async function loadOllamaModels() {
      if (provider === 'ollama') {
        try {
          const models = await fetchOllamaModels();
          console.log('Loaded Ollama models:', models);
          setOllamaModels(models);
          if (models.length > 0 && !models.includes(selectedOllamaModel)) {
            setSelectedOllamaModel(models[0]);
          }
        } catch (error) {
          console.error('Failed to load Ollama models:', error);
        }
      }
    }
    loadOllamaModels();
  }, [provider, selectedOllamaModel]);

  const handleProviderChange = (provider: AIProvider) => {
    console.log('Changing provider to:', provider);
    setProvider(provider);
    initializeAI(provider);
  };

  const handleOllamaModelChange = (model: string) => {
    console.log('Changing Ollama model to:', model);
    setSelectedOllamaModel(model);
    AI_CONFIGS.ollama.model = model;
    initializeAI('ollama');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Thought Organizer</h1>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={provider}
                onChange={(e) => handleProviderChange(e.target.value as AIProvider)}
                className="block w-40 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="ollama">Ollama</option>
                <option value="openai">OpenAI</option>
                <option value="perplexity">Perplexity</option>
              </select>
              {provider === 'ollama' && ollamaModels.length > 0 && (
                <select
                  value={selectedOllamaModel}
                  onChange={(e) => handleOllamaModelChange(e.target.value)}
                  className="block w-40 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {ollamaModels.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <ThoughtInput />
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow overflow-y-auto max-h-[calc(100vh-200px)]">
            <ThoughtList
              onSelectThought={setSelectedThoughtId}
              selectedThoughtId={selectedThoughtId}
            />
          </div>
          <div className="bg-white rounded-lg shadow overflow-y-auto max-h-[calc(100vh-200px)]">
            <AnalysisPanel
              aiResponse={selectedThought?.aiAnalysis ?? null}
              thoughtContent={selectedThought?.content ?? ''}
              thoughtId={selectedThoughtId ?? ''}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;