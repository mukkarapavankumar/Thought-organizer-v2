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
import { Select, Input, Button } from 'antd';
import { BulbOutlined } from '@ant-design/icons';

function App() {
  const [provider, setProvider] = useState<AIProvider>(getCurrentProvider());
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [selectedOllamaModel, setSelectedOllamaModel] = useState<string>('llama2');
  const [selectedThoughtId, setSelectedThoughtId] = useState<string | null>(null);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  const { loadThoughts, getSortedThoughts } = useThoughtStore();
  const { currentSectionId, sections } = useSectionStore();
  const currentSection = sections.find(s => s.id === currentSectionId);
  
  const filteredThoughts = currentSectionId ? getSortedThoughts(currentSectionId) : [];
  const selectedThought = currentSectionId && selectedThoughtId ? 
    filteredThoughts.find(t => t.id === selectedThoughtId) : undefined;

  useEffect(() => {
    async function initializeProvider() {
      await initializeAI(provider);
      if (provider === 'ollama') {
        loadOllamaModels();
      }
    }
    initializeProvider();
  }, [provider]);

  useEffect(() => {
    if (currentSectionId) {
      loadThoughts(currentSectionId);
    }
  }, [currentSectionId, loadThoughts]);

  async function loadOllamaModels() {
    try {
      setIsLoadingModels(true);
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
    } finally {
      setIsLoadingModels(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen flex-col">
        <header className="flex items-center justify-between border-b bg-white px-6 py-3">
          <div className="flex items-center gap-2">
            <BulbOutlined className="text-blue-500" />
            <h1 className="text-xl font-semibold">Thought Organizer</h1>
          </div>
          <div className="flex items-center gap-4">
            <Select
              value={provider}
              onChange={setProvider}
              className="w-[120px]"
            >
              {Object.entries(AI_CONFIGS).map(([key, config]) => (
                <Select.Option key={key} value={key}>
                  {config.name}
                </Select.Option>
              ))}
            </Select>
            <Select
              value={selectedOllamaModel}
              onChange={(value) => {
                setSelectedOllamaModel(value);
                setOllamaModel(value);
              }}
              className="w-[150px]"
              loading={isLoadingModels}
            >
              {ollamaModels.map((model) => (
                <Select.Option key={model} value={model}>
                  {model}
                </Select.Option>
              ))}
            </Select>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-[300px] border-r bg-gray-50">
            <SectionList />
          </div>

          <div className="flex flex-1 overflow-hidden">
            <div className="w-1/3 overflow-y-auto bg-gray-50">
              <div className="p-6">
                <div className="mb-6">
                  <ThoughtInput sectionId={currentSectionId || ''} />
                </div>

                <div className="space-y-4">
                  <ThoughtList
                    thoughts={filteredThoughts}
                    onSelectThought={setSelectedThoughtId}
                    selectedThoughtId={selectedThoughtId}
                  />
                </div>
              </div>
            </div>

            <div className="w-2/3 overflow-y-auto bg-white">
              <AnalysisPanel
                thoughtId={selectedThoughtId || ''}
                thoughtContent={selectedThought?.content || ''}
                aiResponse={selectedThought?.aiAnalysis || null}
                workflow={currentSection?.workflow || []}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;