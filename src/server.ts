import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Thought } from './types/thought';
import { Section } from './types/section';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3001;
const DATA_DIR = process.env.NODE_ENV === 'production' 
  ? join(dirname(__dirname), 'public', 'data')
  : join(dirname(__dirname), 'data');
const STORAGE_PREFIX = 'thought-organizer';
const KEYS_FILE = join(DATA_DIR, 'keys.json');

// Express middleware
app.use(cors());
app.use(express.json());
app.use(express.static(join(dirname(__dirname), 'dist')));

// Helper functions for local file storage
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

async function writeJsonFile(filename: string, data: any) {
  await ensureDataDir();
  const filePath = join(DATA_DIR, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

async function readJsonFile(filename: string) {
  try {
    const filePath = join(DATA_DIR, filename);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

// API Keys endpoints
app.get('/api/keys', async (req: Request, res: Response) => {
  try {
    await ensureDataDir();
    const keys = await fs.readFile(KEYS_FILE, 'utf8').catch(() => '{}');
    res.json(JSON.parse(keys));
  } catch (error) {
    console.error('Error reading API keys:', error);
    res.json({ openAiKey: '', perplexityKey: '' });
  }
});

app.post('/api/keys', async (req: Request, res: Response) => {
  try {
    await ensureDataDir();
    await fs.writeFile(KEYS_FILE, JSON.stringify(req.body));
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving API keys:', error);
    res.status(500).json({ error: 'Failed to save API keys' });
  }
});

// OpenAI proxy endpoint
app.post('/api/openai', async (req: Request, res: Response) => {
  try {
    const keys = JSON.parse(await fs.readFile(KEYS_FILE, 'utf8'));
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${keys.openAiKey}`,
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ error: 'Failed to process OpenAI request' });
  }
});

// Perplexity proxy endpoint
app.post('/api/perplexity', async (req: Request, res: Response) => {
  try {
    const keys = JSON.parse(await fs.readFile(KEYS_FILE, 'utf8'));
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${keys.perplexityKey}`,
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Perplexity API error:', error);
    res.status(500).json({ error: 'Failed to process Perplexity request' });
  }
});

// Thoughts endpoints
app.post('/api/thoughts/:sectionId', async (req: Request<{ sectionId: string }, any, Thought[]>, res: Response) => {
  try {
    const { sectionId } = req.params;
    const thoughts: Thought[] = req.body;
    const filename = `${STORAGE_PREFIX}-thoughts-${sectionId}.json`;
    await writeJsonFile(filename, thoughts);
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving thoughts:', error);
    res.status(500).json({ error: 'Failed to save thoughts' });
  }
});

app.get('/api/thoughts/:sectionId', async (req: Request<{ sectionId: string }>, res: Response) => {
  try {
    const { sectionId } = req.params;
    const filename = `${STORAGE_PREFIX}-thoughts-${sectionId}.json`;
    const thoughts = await readJsonFile(filename);
    res.json(thoughts || []);
  } catch (error) {
    console.error('Error loading thoughts:', error);
    res.status(500).json({ error: 'Failed to load thoughts' });
  }
});

// Sections endpoints
app.post('/api/sections', async (req: Request<any, any, Section[]>, res: Response) => {
  try {
    const sections: Section[] = req.body;
    const filename = `${STORAGE_PREFIX}-sections.json`;
    await writeJsonFile(filename, sections);
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving sections:', error);
    res.status(500).json({ error: 'Failed to save sections' });
  }
});

app.get('/api/sections', async (req: Request, res: Response) => {
  try {
    const filename = `${STORAGE_PREFIX}-sections.json`;
    const sections = await readJsonFile(filename);
    res.json(sections || []);
  } catch (error) {
    console.error('Error loading sections:', error);
    res.status(500).json({ error: 'Failed to load sections' });
  }
});

// DuckDuckGo search endpoint
app.get('/api/search', async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const response = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`);
    const html = await response.text();
    res.send(html);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to perform search' });
  }
});

// Serve index.html for all other routes in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(join(dirname(__dirname), 'dist', 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 