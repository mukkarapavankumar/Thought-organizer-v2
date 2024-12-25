const OLLAMA_BASE_URL = 'http://localhost:11434';

export interface OllamaGenerateParams {
  model: string;
  prompt: string;
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    repeat_penalty?: number;
    seed?: number;
    stop?: string[];
    num_predict?: number;
  };
}

export interface OllamaResponse {
  model: string;
  response: string;
  done: boolean;
}

export async function checkOllamaHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    return response.ok;
  } catch (error) {
    console.error('Failed to check Ollama health:', error);
    return false;
  }
}

export async function listOllamaModels(): Promise<string[]> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    if (!response.ok) {
      throw new Error('Failed to fetch models');
    }
    const data = await response.json();
    return data.models?.map((model: any) => model.name) || [];
  } catch (error) {
    console.error('Failed to list Ollama models:', error);
    return [];
  }
}

export async function generateOllamaCompletion(params: OllamaGenerateParams): Promise<string> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...params,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || 'Failed to generate completion');
    }

    const data: OllamaResponse = await response.json();
    return data.response;
  } catch (error) {
    console.error('Ollama generation error:', error);
    throw error;
  }
}

export async function pullOllamaModel(modelName: string): Promise<void> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/pull`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: modelName,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to pull model');
    }
  } catch (error) {
    console.error(`Failed to pull Ollama model ${modelName}:`, error);
    throw error;
  }
}
