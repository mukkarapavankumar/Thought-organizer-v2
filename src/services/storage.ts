import { createClient } from '@supabase/supabase-js';
import { Thought } from '../types/thought';
import { Section } from '../types/section';

// Get the base URL from Vite's import.meta.env
const BASE_URL = import.meta.env.BASE_URL;
const IS_GITHUB_PAGES = BASE_URL.includes('/Thought-organizer-v2');

// In GitHub Pages, we'll use static JSON files instead of an API
const API_URL = IS_GITHUB_PAGES
  ? `${BASE_URL}data`  // This will point to the public/data directory
  : import.meta.env.DEV 
    ? 'http://localhost:3001/api'
    : `${window.location.origin}/api`;

// Initialize Supabase client
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface StorageService {
  saveThoughts: (sectionId: string, thoughts: Thought[]) => Promise<void>;
  loadThoughts: (sectionId: string) => Promise<Thought[]>;
  saveSections: (sections: Section[]) => Promise<void>;
  loadSections: () => Promise<Section[]>;
}

export const storage: StorageService = {
  async saveThoughts(sectionId: string, thoughts: Thought[]): Promise<void> {
    if (IS_GITHUB_PAGES) {
      console.warn('Saving is not supported in GitHub Pages mode');
      return;
    }

    if (supabase) {
      try {
        const { error } = await supabase
          .from('thoughts')
          .upsert(
            thoughts.map(thought => ({
              ...thought,
              section_id: sectionId,
              created_at: thought.createdAt,
              updated_at: thought.updatedAt,
            })),
            { onConflict: 'id' }
          );
        
        if (!error) return;
        console.warn('Supabase save failed, falling back to local storage:', error);
      } catch (error) {
        console.warn('Supabase save failed, falling back to local storage:', error);
      }
    }

    // Local API fallback
    try {
      const response = await fetch(`${API_URL}/thoughts/${sectionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(thoughts),
      });

      if (!response.ok) {
        throw new Error('Failed to save thoughts');
      }
    } catch (error) {
      console.error('Error saving thoughts:', error);
      throw new Error('Failed to save thoughts');
    }
  },

  async loadThoughts(sectionId: string): Promise<Thought[]> {
    if (IS_GITHUB_PAGES) {
      try {
        const response = await fetch(`${API_URL}/static.json`);
        if (!response.ok) {
          throw new Error('Failed to load thoughts');
        }
        const data = await response.json();
        return (data.thoughts[sectionId] || []).map((thought: any) => ({
          ...thought,
          createdAt: new Date(thought.createdAt),
          updatedAt: thought.updatedAt ? new Date(thought.updatedAt) : undefined,
        }));
      } catch (error) {
        console.error('Error loading thoughts:', error);
        return [];
      }
    }

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('thoughts')
          .select('*')
          .eq('section_id', sectionId)
          .order('created_at', { ascending: false });
        
        if (!error && data) {
          return data.map(thought => ({
            ...thought,
            sectionId: thought.section_id,
            createdAt: new Date(thought.created_at),
            updatedAt: thought.updated_at ? new Date(thought.updated_at) : undefined,
          }));
        }
        console.warn('Supabase load failed, falling back to local storage:', error);
      } catch (error) {
        console.warn('Supabase load failed, falling back to local storage:', error);
      }
    }

    // Local API fallback
    try {
      const response = await fetch(`${API_URL}/thoughts/${sectionId}`);
      if (!response.ok) {
        throw new Error('Failed to load thoughts');
      }

      const thoughts = await response.json();
      return thoughts.map((thought: any) => ({
        ...thought,
        createdAt: new Date(thought.createdAt),
        updatedAt: thought.updatedAt ? new Date(thought.updatedAt) : undefined,
      }));
    } catch (error) {
      console.error('Error loading thoughts:', error);
      return [];
    }
  },

  async saveSections(sections: Section[]): Promise<void> {
    if (IS_GITHUB_PAGES) {
      console.warn('Saving is not supported in GitHub Pages mode');
      return;
    }

    if (supabase) {
      try {
        const { error } = await supabase
          .from('sections')
          .upsert(
            sections.map(section => ({
              ...section,
              created_at: section.createdAt,
              updated_at: section.updatedAt,
              workflow_steps: section.workflowSteps,
            })),
            { onConflict: 'id' }
          );
        
        if (!error) return;
        console.warn('Supabase save failed, falling back to local storage:', error);
      } catch (error) {
        console.warn('Supabase save failed, falling back to local storage:', error);
      }
    }

    // Local API fallback
    try {
      const response = await fetch(`${API_URL}/sections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sections),
      });

      if (!response.ok) {
        throw new Error('Failed to save sections');
      }
    } catch (error) {
      console.error('Error saving sections:', error);
      throw new Error('Failed to save sections');
    }
  },

  async loadSections(): Promise<Section[]> {
    if (IS_GITHUB_PAGES) {
      try {
        const response = await fetch(`${API_URL}/static.json`);
        if (!response.ok) {
          throw new Error('Failed to load sections');
        }
        const data = await response.json();
        return (data.sections || []).map((section: any) => ({
          ...section,
          createdAt: new Date(section.createdAt),
          updatedAt: new Date(section.updatedAt),
        }));
      } catch (error) {
        console.error('Error loading sections:', error);
        return [];
      }
    }

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('sections')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (!error && data) {
          return data.map(section => ({
            ...section,
            workflowSteps: section.workflow_steps,
            createdAt: new Date(section.created_at),
            updatedAt: new Date(section.updated_at),
          }));
        }
        console.warn('Supabase load failed, falling back to local storage:', error);
      } catch (error) {
        console.warn('Supabase load failed, falling back to local storage:', error);
      }
    }

    // Local API fallback
    try {
      const response = await fetch(`${API_URL}/sections`);
      if (!response.ok) {
        throw new Error('Failed to load sections');
      }

      const sections = await response.json();
      return sections.map((section: any) => ({
        ...section,
        createdAt: new Date(section.createdAt),
        updatedAt: new Date(section.updatedAt),
      }));
    } catch (error) {
      console.error('Error loading sections:', error);
      return [];
    }
  },
};