import React, { useEffect, useState } from 'react';
import { Collapse, Input, Button, message } from 'antd';
import { useStore } from '../store';

const { Panel } = Collapse;

export function ApiKeyManager() {
  const { apiKeys, saveApiKeys, loadApiKeys } = useStore();
  const [openAiKey, setOpenAiKey] = useState('');
  const [perplexityKey, setPerplexityKey] = useState('');

  useEffect(() => {
    loadApiKeys();
  }, [loadApiKeys]);

  useEffect(() => {
    setOpenAiKey(apiKeys.openAiKey);
    setPerplexityKey(apiKeys.perplexityKey);
  }, [apiKeys]);

  const handleSave = async () => {
    try {
      await saveApiKeys({ openAiKey, perplexityKey });
      message.success('API keys saved successfully');
    } catch (error) {
      message.error('Failed to save API keys');
    }
  };

  return (
    <Collapse className="absolute bottom-4 left-4 w-70">
      <Panel header="API Keys" key="1">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">OpenAI API Key</label>
            <Input.Password
              value={openAiKey}
              onChange={(e) => setOpenAiKey(e.target.value)}
              placeholder="Enter OpenAI API key"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Perplexity API Key</label>
            <Input.Password
              value={perplexityKey}
              onChange={(e) => setPerplexityKey(e.target.value)}
              placeholder="Enter Perplexity API key"
            />
          </div>
          <Button type="primary" onClick={handleSave} className="w-full">
            Save Keys
          </Button>
        </div>
      </Panel>
    </Collapse>
  );
}
