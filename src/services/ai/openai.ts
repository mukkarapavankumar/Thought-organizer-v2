import OpenAI from 'openai';
import { AIResponse } from '../../types/thought';
import { AIProvider, AI_CONFIGS, DEFAULT_PROVIDER } from './config';
import { generateOllamaCompletion } from './ollama';
import { chatCompletion as perplexityChatCompletion } from './perplexity';
import { ChatMessage, ThoughtChatContext } from '../../types/thought';

let currentProvider: AIProvider = DEFAULT_PROVIDER;
let openai: OpenAI | null = null;

export function initializeAI(provider: AIProvider = DEFAULT_PROVIDER) {
  console.log('Initializing AI with provider:', provider); // Debug log
  
  // Explicitly set the current provider
  currentProvider = provider;
  
  const config = AI_CONFIGS[provider];
  
  // Reset OpenAI client based on provider
  if (!config.isLocal) {
    openai = new OpenAI({
      apiKey: config.apiKey,
      dangerouslyAllowBrowser: true,
      baseURL: config.baseURL,
    });
  } else {
    openai = null;  // No OpenAI client needed for local models
  }
}

export function getCurrentProvider(): AIProvider {
  // Ensure we always return a valid provider
  const validProviders: AIProvider[] = ['openai', 'ollama', 'perplexity'];
  if (validProviders.includes(currentProvider)) {
    return currentProvider;
  }
  
  // Fallback to default provider
  console.warn(`Invalid current provider: ${currentProvider}. Falling back to default.`);
  return DEFAULT_PROVIDER;
}

async function createCompletion(messages: any[], temperature: number = 0.7) {
  const config = AI_CONFIGS[currentProvider];
  
  // Format messages for API
  const formattedMessages = messages.map(msg => ({
    role: msg.role,
    content: msg.content
  }));
  
  if (config.isLocal) {
    const response = await generateOllamaCompletion(config.model, formattedMessages);
    return { choices: [{ message: { content: response.content } }] };
  } else if (currentProvider === 'perplexity') {
    // Ensure the last message is from the user for Perplexity
    const lastMessage = formattedMessages[formattedMessages.length - 1];
    if (lastMessage && lastMessage.role !== 'user') {
      // If not, add the last non-user message's content as part of the user's query
      const userQuery = `Given the assistant's response: "${lastMessage.content}", what would you like to know?`;
      formattedMessages.push({
        role: 'user',
        content: userQuery
      });
    }
    
    const response = await perplexityChatCompletion({
      model: config.model,
      messages: formattedMessages,
      temperature,
      max_tokens: 1000,
    });
    return { choices: [{ message: { content: response } }] };
  } else if (openai) {
    return await openai.chat.completions.create({
      model: config.model,
      messages: formattedMessages,
      temperature,
    });
  }
  throw new Error('No AI provider initialized');
}

async function extractJSONFromResponse(responseText: string): Promise<any> {
  // Try to extract JSON from code blocks or between specific markers
  const jsonMatches = responseText.match(/```json\n([\s\S]*?)\n```/);
  if (jsonMatches) {
    try {
      return JSON.parse(jsonMatches[1]);
    } catch {}
  }

  // Try to extract JSON from between { and }
  const bracketMatches = responseText.match(/\{[\s\S]*\}/);
  if (bracketMatches) {
    try {
      return JSON.parse(bracketMatches[0]);
    } catch {}
  }

  // Fallback: try to clean and parse
  const cleanedText = responseText
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .replace(/\n/g, '')
    .trim();

  try {
    return JSON.parse(cleanedText);
  } catch {
    // If all parsing fails, return a default structure
    console.error('Could not parse response:', responseText);
    return {
      marketImpact: 5,
      viability: 5
    };
  }
}

const extractRanking = (content: string): { marketImpact: number, viability: number } => {
  // Try to extract numbers from the content
  const marketImpactMatch = content.match(/market\s*impact.*?(\d+)/i);
  const viabilityMatch = content.match(/viability.*?(\d+)/i);

  const marketImpact = marketImpactMatch 
    ? Math.max(0, Math.min(10, parseInt(marketImpactMatch[1], 10)))
    : 5;

  const viability = viabilityMatch
    ? Math.max(0, Math.min(10, parseInt(viabilityMatch[1], 10)))
    : 5;

  return { marketImpact, viability };
};

export async function analyzeThought(content: string): Promise<AIResponse> {
  try {
    const [enhancementResponse, marketResearchResponse, businessCaseResponse, rankingResponse] = await Promise.all([
      createCompletion([
        {
          role: 'system',
          content: 'You are an AI thought enhancer as a part of a thought organizer tool. This tool is used by developers to dump all their new business ideas and AI generates enhancements and business cases. Provide a thoughtful enhancement to the following thought.'
        },
        {
          role: 'user',
          content
        }
      ]),
      createCompletion([
        {
          role: 'system',
          content: 'You are an AI Market Researcher as a part of a thought organizer tool. This tool is used by developers to dump all their new business ideas and AI generates enhancements and business cases. Provide market research insights for the following thought.'
        },
        {
          role: 'user',
          content
        }
      ]),
      createCompletion([
        {
          role: 'system',
          content: 'You are an AI Business Case Designer as a part of a thought organizer tool. This tool is used by developers to dump all their new business ideas and AI generates enhancements and business cases. Develop a comprehensive business case for the following thought, including potential revenue streams, target market, competitive landscape, and key value propositions.'
        },
        {
          role: 'user',
          content
        }
      ]),
      createCompletion([
        {
          role: 'system',
          content: 'Provide market impact and viability scores (0-10). Respond with a description that includes the scores, like: "Market Impact: X/10, Viability: Y/10"'
        },
        {
          role: 'user',
          content
        }
      ])
    ]);

    const enhancement = enhancementResponse.choices[0].message.content || '';
    const marketResearch = marketResearchResponse.choices[0].message.content || '';
    const businessCase = businessCaseResponse.choices[0].message.content || '';
    const rankingContent = rankingResponse.choices[0].message.content || '';
    
    let ranking;
    try {
      // First try to parse as JSON
      ranking = JSON.parse(rankingContent);
    } catch (jsonError) {
      // If JSON parsing fails, extract numbers from text
      ranking = extractRanking(rankingContent);
    }

    return {
      enhancement,
      marketResearch,
      businessCase,
      ranking: {
        marketImpact: Math.max(0, Math.min(10, ranking.marketImpact || 5)),
        viability: Math.max(0, Math.min(10, ranking.viability || 5))
      }
    };
  } catch (error) {
    console.error('Error analyzing thought:', error);
    return {
      enhancement: '',
      marketResearch: '',
      businessCase: '',
      ranking: { marketImpact: 5, viability: 5 }
    };
  }
}

export async function generateChatCompletion(
  messages: ChatMessage[], 
  context?: ThoughtChatContext
): Promise<string> {
  // Prepare context-aware system message if context is provided
  const contextMessages: ChatMessage[] = context ? [
    {
      role: 'system',
      content: `You are a helpful AI assistant. Consider the following context for this conversation, but make sure to directly address the user's latest question:

Context:
Original Thought: ${context.thoughtContent}
${context.enhancement ? `Enhancement: ${context.enhancement}` : ''}
${context.marketResearch ? `Market Research: ${context.marketResearch}` : ''}
${context.businessCase ? `Business Case: ${context.businessCase}` : ''}`,
      id: `system-context-${Date.now()}`,
      timestamp: Date.now()
    }
  ] : [];

  // Get the latest user message
  const latestMessage = messages[messages.length - 1];
  
  // Combine messages: context + chat history (excluding latest) + latest question
  const fullMessageChain = [
    ...contextMessages,
    ...messages.slice(0, -1).map(msg => ({
      role: msg.role,
      content: msg.content
    })),
    {
      role: latestMessage.role,
      content: latestMessage.content
    }
  ];

  try {
    const completion = await createCompletion(fullMessageChain);
    
    // More robust type guard for OpenAI response
    if (completion && typeof completion === 'object') {
      // Handle OpenAI response format
      if (completion.choices && Array.isArray(completion.choices) && 
          completion.choices[0] && 
          completion.choices[0].message && 
          completion.choices[0].message.content) {
        return completion.choices[0].message.content as string;
      }
      
      // Handle Ollama or other formats
      if ('content' in completion && completion.content) {
        return completion.content as string;
      }
    }

    // Log the unexpected response for debugging
    console.error('Unexpected completion response:', JSON.stringify(completion));
    return 'I apologize, but I encountered an unexpected response format.';
  } catch (error) {
    console.error('Error in chat completion:', error);
    return 'I apologize, but I encountered an error processing your request.';
  }
}