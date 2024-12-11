interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
}

export async function fetchOllamaModels(): Promise<string[]> {
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Fetched Ollama models:', data); // Debug log
    
    // Correctly extract model names from the response
    const modelNames = data.models 
      ? data.models.map((model: OllamaModel) => model.name)
      : data.models || [];
    
    console.log('Extracted model names:', modelNames);
    return modelNames;
  } catch (error) {
    console.error('Error fetching Ollama models:', error);
    return [];
  }
}

export async function generateOllamaCompletion(model: string, messages: any[]) {
  try {
    console.log('Generating Ollama completion with model:', model); // Debug log
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        stream: false
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Ollama response:', data); // Debug log

    // Ensure we return an object with a content property
    return {
      content: data.message?.content || '',
      raw: data
    };
  } catch (error) {
    console.error('Error generating Ollama completion:', error);
    throw error;
  }
}
