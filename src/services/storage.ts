import { createClient } from '@supabase/supabase-js';
import { Thought } from '../types/thought';
import { Section } from '../types/section';

// Get the base URL from Vite's import.meta.env
const BASE_URL = import.meta.env.BASE_URL;
const API_URL = import.meta.env.DEV 
  ? 'http://localhost:3001/api'
  : `${window.location.origin}${BASE_URL}api`;

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
        // If there's an error, fall through to local storage
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
        // If there's an error or no data, fall through to local storage
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
        // If there's an error, fall through to local storage
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
        // If there's an error or no data, fall through to local storage
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