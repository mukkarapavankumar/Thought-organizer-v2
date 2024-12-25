import React, { useState, useEffect } from 'react';
import { Lightbulb } from 'lucide-react';
import { ThoughtInput } from './components/ThoughtInput';
import { ThoughtList } from './components/ThoughtList';
import { AnalysisPanel } from './components/AnalysisPanel';
import { SectionList } from './components/SectionList';
import { AIProvider, AI_CONFIGS } from './services/ai/config';
import { initializeAI, getCurrentProvider, setOllamaModel } from './services/ai/openai';
import { listOllamaModels } from './services/ai/ollama';
import { useThoughtStore } from './store/useThoughtStore';
import { useSectionStore } from './store/useSectionStore';

function App() {
  const [provider, setProvider] = useState<AIProvider>(getCurrentProvider());
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [selectedOllamaModel, setSelectedOllamaModel] = useState<string>('llama2');
  const [selectedThoughtId, setSelectedThoughtId] = useState<string | null>(null);
  
  const thoughts = useThoughtStore((state) => state.thoughts);
  const currentSectionId = useSectionStore((state) => state.currentSectionId);
  const currentSection = useSectionStore((state) => 
    state.sections.find(s => s.id === state.currentSectionId)
  );
  
  const filteredThoughts = thoughts.filter(t => t.sectionId === currentSectionId);
  const selectedThought = thoughts.find(t => t.id === selectedThoughtId);

  useEffect(() => {
    async function initializeProvider() {
      await initializeAI(provider);
      if (provider === 'ollama') {
        loadOllamaModels();
      }
    }
    initializeProvider();
  }, [provider]);

  async function loadOllamaModels() {
    try {
      const models = await listOllamaModels();
      console.log('Available Ollama models:', models);
      setOllamaModels(models);
      if (models.length > 0 && !models.includes(selectedOllamaModel)) {
        const defaultModel = models.includes('llama2') ? 'llama2' : models[0];
        setSelectedOllamaModel(defaultModel);
        setOllamaModel(defaultModel);
      }
    } catch (error) {
      console.error('Failed to load Ollama models:', error);
    }
  }

  const handleProviderChange = async (newProvider: AIProvider) => {
    console.log('Changing provider to:', newProvider);
    setProvider(newProvider);
  };

  const handleOllamaModelChange = (model: string) => {
    console.log('Changing Ollama model to:', model);
    setSelectedOllamaModel(model);
    setOllamaModel(model);
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
        <div className="grid grid-cols-[250px_1fr] gap-6">
          <div className="bg-white rounded-lg shadow">
            <SectionList />
          </div>
          
          <div className="space-y-6">
            {currentSection ? (
              <>
                <div className="mb-6">
                  <ThoughtInput sectionId={currentSection.id} />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow overflow-y-auto max-h-[calc(100vh-200px)]">
                    <ThoughtList
                      thoughts={filteredThoughts}
                      onSelectThought={setSelectedThoughtId}
                      selectedThoughtId={selectedThoughtId}
                    />
                  </div>
                  <div className="bg-white rounded-lg shadow overflow-y-auto max-h-[calc(100vh-200px)]">
                    <AnalysisPanel
                      aiResponse={selectedThought?.aiAnalysis ?? null}
                      thoughtContent={selectedThought?.content ?? ''}
                      thoughtId={selectedThoughtId ?? ''}
                      workflow={currentSection.workflow}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-[calc(100vh-200px)] bg-white rounded-lg shadow">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900">No Section Selected</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Please select or create a section to start organizing your thoughts.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;