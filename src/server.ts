import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Thought } from './types/thought';
import { Section } from './types/section';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3001;
const DATA_DIR = process.env.NODE_ENV === 'production' 
  ? join(dirname(__dirname), 'public', 'data')
  : join(dirname(__dirname), 'data');
const STORAGE_PREFIX = 'thought-organizer';

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

// Serve index.html for all other routes in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(join(dirname(__dirname), 'dist', 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 