import { createClient } from '@supabase/supabase-js';
import { Thought } from '../types/thought';
import { Section } from '../types/section';
import fs from 'fs';
import path from 'path';

// Get the base URL from Vite's import.meta.env
const BASE_URL = import.meta.env.BASE_URL;
const IS_GITHUB_PAGES = BASE_URL.includes('/Thought-organizer-v2');

// Get the base URL for API calls
const API_URL = window.electron 
  ? 'http://localhost:3001/api'  // Always use local server in Electron app
  : import.meta.env.DEV 
    ? 'http://localhost:3001/api'
    : `${window.location.origin}/api`;

// Initialize Supabase client
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Get the data directory path
async function getDataPath() {
  if (window.electron) {
    return await window.electron.getUserDataPath();
  }
  return 'data'; // Fallback to local 'data' directory for web
}

// Helper function to ensure data directory exists
async function ensureDataDir() {
  const dataPath = await getDataPath();
  if (!fs.existsSync(dataPath)) {
    await fs.promises.mkdir(dataPath, { recursive: true });
  }
  return dataPath;
}

// Helper function to write JSON file
async function writeJsonFile(filename: string, data: any) {
  const dataPath = await ensureDataDir();
  const filePath = path.join(dataPath, filename);
  await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
}

// Helper function to read JSON file
async function readJsonFile(filename: string) {
  const dataPath = await ensureDataDir();
  const filePath = path.join(dataPath, filename);
  try {
    const data = await fs.promises.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

export interface StorageService {
  saveThoughts: (sectionId: string, thoughts: Thought[]) => Promise<void>;
  loadThoughts: (sectionId: string) => Promise<Thought[]>;
  saveSections: (sections: Section[]) => Promise<void>;
  loadSections: () => Promise<Section[]>;
}

export const storage: StorageService = {
  async saveThoughts(sectionId: string, thoughts: Thought[]) {
    try {
      const response = await fetch(`${API_URL}/thoughts/${sectionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(thoughts),
      });
      if (!response.ok) throw new Error('Failed to save thoughts');
    } catch (error) {
      console.error('Error saving thoughts:', error);
      throw error;
    }
  },

  async loadThoughts(sectionId: string): Promise<Thought[]> {
    try {
      const response = await fetch(`${API_URL}/thoughts/${sectionId}`);
      if (!response.ok) throw new Error('Failed to load thoughts');
      return await response.json();
    } catch (error) {
      console.error('Error loading thoughts:', error);
      return [];
    }
  },

  async saveSections(sections: Section[]) {
    try {
      const response = await fetch(`${API_URL}/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sections),
      });
      if (!response.ok) throw new Error('Failed to save sections');
    } catch (error) {
      console.error('Error saving sections:', error);
      throw error;
    }
  },

  async loadSections(): Promise<Section[]> {
    try {
      const response = await fetch(`${API_URL}/sections`);
      if (!response.ok) throw new Error('Failed to load sections');
      return await response.json();
    } catch (error) {
      console.error('Error loading sections:', error);
      return [];
    }
  },
};