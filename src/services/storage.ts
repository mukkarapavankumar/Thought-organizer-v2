import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { Thought } from '../types/thought';
import { auth } from './auth';

const DATA_DIR = path.join(process.cwd(), 'data');
const THOUGHTS_FILE = path.join(DATA_DIR, 'thoughts.json');

// Initialize Supabase client
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface StorageService {
  saveThoughts: (thoughts: Thought[], userId?: string) => Promise<void>;
  loadThoughts: (userId?: string) => Promise<Thought[]>;
}

export const storage: StorageService = {
  async saveThoughts(thoughts: Thought[], userId?: string): Promise<void> {
    const effectiveUserId = userId || await auth.getCurrentUser();
    const thoughtsWithUserId = thoughts.map(thought => ({
      ...thought,
      user_id: effectiveUserId
    }));

    if (supabase && effectiveUserId) {
      try {
        const { error } = await supabase
          .from('thoughts')
          .upsert(thoughtsWithUserId, { 
            onConflict: 'id',
          });
        
        if (!error) return;
        // If there's an error, fall through to local storage
      } catch (error) {
        console.warn('Supabase save failed, falling back to local storage:', error);
      }
    }

    // Local storage fallback
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(
        THOUGHTS_FILE,
        JSON.stringify(thoughtsWithUserId, null, 2),
        'utf-8'
      );
    } catch (error) {
      console.error('Error saving thoughts locally:', error);
      throw new Error('Failed to save thoughts to any storage');
    }
  },

  async loadThoughts(userId?: string): Promise<Thought[]> {
    const effectiveUserId = userId || await auth.getCurrentUser();

    if (supabase && effectiveUserId) {
      try {
        const { data, error } = await supabase
          .from('thoughts')
          .select('*')
          .eq('user_id', effectiveUserId)
          .order('created_at', { ascending: false });
        
        if (!error && data) return data;
        // If there's an error or no data, fall through to local storage
      } catch (error) {
        console.warn('Supabase load failed, falling back to local storage:', error);
      }
    }

    // Local storage fallback
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      try {
        await fs.access(THOUGHTS_FILE);
      } catch {
        await fs.writeFile(THOUGHTS_FILE, '[]', 'utf-8');
        return [];
      }

      const data = await fs.readFile(THOUGHTS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading thoughts locally:', error);
      return [];
    }
  }
};