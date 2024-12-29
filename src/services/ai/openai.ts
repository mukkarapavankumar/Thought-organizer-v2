import { WorkflowStep } from '../../types/section';
import { ThoughtAnalysis } from '../../types/thought';
import { AIProvider } from './config';
import { checkOllamaHealth, generateOllamaCompletion, listOllamaModels } from './ollama';

// Default to Ollama, switch to OpenAI if API key is available
const hasOpenAIKey = Boolean(import.meta.env.VITE_OPENAI_API_KEY);
let currentProvider: AIProvider = hasOpenAIKey ? 'openai' : 'ollama';
let ollamaModel = 'llama3.2:1b';  // Default model

export function getCurrentProvider(): AIProvider {
  return currentProvider;
}

export function setOllamaModel(model: string) {
  ollamaModel = model;
}

export async function initializeAI(provider: AIProvider) {
  // Only allow switching to OpenAI if API key is available
  if (provider === 'openai' && !hasOpenAIKey) {
    console.warn('OpenAI API key not configured. Defaulting to Ollama.');
    currentProvider = 'ollama';
  } else {
    currentProvider = provider;
  }

  // If using Ollama, check if it's running
  if (currentProvider === 'ollama') {
    const isOllamaRunning = await checkOllamaHealth();
    if (!isOllamaRunning) {
      console.error('Ollama is not running. Please start the Ollama server.');
      if (hasOpenAIKey) {
        console.warn('Falling back to OpenAI...');
        currentProvider = 'openai';
      }
    }
  }
}

export async function analyzeThoughtWithWorkflow(
  content: string,
  workflow: WorkflowStep[]
): Promise<ThoughtAnalysis> {
  const stepResults = new Map<string, string>();
  const steps = [];

  for (const step of workflow) {
    // Build context from previous steps if needed
    let contextText = '';
    if (step.contextSteps.length > 0) {
      contextText = step.contextSteps
        .map(stepId => {
          const prevStep = workflow.find(s => s.id === stepId);
          const prevResult = stepResults.get(stepId);
          if (prevStep && prevResult) {
            return `${prevStep.name}:\n${prevResult}\n\n`;
          }
          return '';
        })
        .join('');
    }

    const prompt = contextText
      ? `${contextText}\nBased on the above context:\n${step.prompt}\n\n${content}`
      : `${step.prompt}\n\n${content}`;

    try {
      const response = await generateCompletion(prompt, step.model);
      stepResults.set(step.id, response);
      steps.push({
        stepId: step.id,
        content: response,
      });
    } catch (error) {
      console.error(`Error in workflow step "${step.name}":`, error);
      steps.push({
        stepId: step.id,
        content: 'Failed to generate analysis. Please try again.',
      });
    }
  }

  return { steps };
}

export async function generateCompletion(prompt: string, modelOverride?: string): Promise<string> {
  try {
    // If modelOverride has a provider prefix (e.g., "openai:gpt-4"), use that provider
    if (modelOverride) {
      const [provider, model] = modelOverride.split(':');
      switch (provider) {
        case 'openai':
          return await generateOpenAICompletion(prompt, model);
        case 'perplexity':
          return await generatePerplexityCompletion(prompt, model);
        case 'ollama':
          return await generateOllamaCompletion({
            model,
            prompt,
            options: {
              temperature: 0.7,
            },
          });
      }
    }

    // If no override or no provider prefix, use the current provider
    switch (currentProvider) {
      case 'ollama':
        return await generateOllamaCompletion({
          model: ollamaModel,
          prompt,
          options: {
            temperature: 0.7,
          },
        });
      case 'openai':
        return await generateOpenAICompletion(prompt);
      case 'perplexity':
        return await generatePerplexityCompletion(prompt);
      default:
        throw new Error('Invalid AI provider');
    }
  } catch (error) {
    console.error(`Error with ${currentProvider}:`, error);
    
    if (currentProvider === 'ollama' && hasOpenAIKey) {
      console.log('Falling back to OpenAI...');
      try {
        return await generateOpenAICompletion(prompt);
      } catch (fallbackError) {
        console.error('OpenAI fallback failed:', fallbackError);
        throw fallbackError;
      }
    }
    
    throw error;
  }
}

async function generateOpenAICompletion(prompt: string, modelOverride?: string): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelOverride || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.error?.message || 'Failed to generate completion');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI error:', error);
    throw error;
  }
}

async function generatePerplexityCompletion(prompt: string, modelOverride?: string): Promise<string> {
  const apiKey = import.meta.env.VITE_PERPLEXITY_API_KEY;
  if (!apiKey) {
    throw new Error('Perplexity API key is not configured');
  }

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelOverride || 'mixtral-8x7b-instruct',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.error?.message || 'Failed to generate completion');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Perplexity error:', error);
    throw error;
  }
}