import OpenAI from 'openai';
import { Thought, ThoughtCluster } from '../../types/thought';

const openai = import.meta.env.VITE_OPENAI_API_KEY 
  ? new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true,
    }) 
  : null;

export async function clusterThoughts(thoughts: Thought[]): Promise<ThoughtCluster[]> {
  if (thoughts.length === 0) return [];

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: 'You are an AI clustering agent that groups similar ideas together and provides meaningful cluster names and summaries.',
      },
      {
        role: 'user',
        content: `Please analyze and cluster these ideas into meaningful groups. For each group, provide a name and summary: ${JSON.stringify(
          thoughts.map((t) => t.content)
        )}`,
      },
    ],
    temperature: 0.5,
  });

  try {
    const clusters = JSON.parse(response.choices[0].message.content || '[]');
    return clusters.map((cluster: any) => ({
      id: crypto.randomUUID(),
      name: cluster.name,
      thoughts: cluster.thoughtIds,
      summary: cluster.summary,
    }));
  } catch (error) {
    console.error('Error parsing clusters:', error);
    return [];
  }
}