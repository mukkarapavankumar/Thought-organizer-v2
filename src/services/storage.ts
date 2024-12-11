import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const THOUGHTS_FILE = path.join(DATA_DIR, 'thoughts.json');

export interface StorageService {
  saveThoughts: (thoughts: any[]) => Promise<void>;
  loadThoughts: () => Promise<any[]>;
}

export const storage: StorageService = {
  async saveThoughts(thoughts: any[]): Promise<void> {
    try {
      // Ensure the data directory exists
      await fs.mkdir(DATA_DIR, { recursive: true });
      
      // Save thoughts to file
      await fs.writeFile(
        THOUGHTS_FILE,
        JSON.stringify(thoughts, null, 2),
        'utf-8'
      );
    } catch (error) {
      console.error('Error saving thoughts:', error);
      throw error;
    }
  },

  async loadThoughts(): Promise<any[]> {
    try {
      // Ensure the data directory exists
      await fs.mkdir(DATA_DIR, { recursive: true });
      
      // Check if file exists
      try {
        await fs.access(THOUGHTS_FILE);
      } catch {
        // If file doesn't exist, create it with empty array
        await fs.writeFile(THOUGHTS_FILE, '[]', 'utf-8');
        return [];
      }

      // Read and parse thoughts
      const data = await fs.readFile(THOUGHTS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading thoughts:', error);
      throw error;
    }
  }
};
