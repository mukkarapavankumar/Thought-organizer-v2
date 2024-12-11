import { env } from 'process';

interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface PerplexityOptions {
  model?: string;
  messages: PerplexityMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  stream?: boolean;
}

export async function chatCompletion(options: PerplexityOptions): Promise<string> {
  const apiKey = import.meta.env.VITE_PERPLEXITY_API_KEY;
  
  if (!apiKey) {
    throw new Error('Perplexity API key is not set');
  }

  const requestOptions = {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: options.model || 'llama-3.1-sonar-small-128k-online',
      messages: options.messages,
      max_tokens: options.max_tokens,
      temperature: options.temperature ?? 0.2,
      top_p: options.top_p ?? 0.9,
      stream: options.stream ?? false
    })
  };

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', requestOptions);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Perplexity API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No response from Perplexity API';
  } catch (error) {
    console.error('Perplexity API call failed:', error);
    throw error;
  }
}

export async function conductMarketResearch(content: string): Promise<string> {
  return chatCompletion({
    messages: [
      { role: 'system', content: 'Be precise and concise in market research.' },
      { role: 'user', content: `Conduct a brief market research analysis for the following idea: ${content}. Consider market size, competition, and potential opportunities.` }
    ]
  });
}