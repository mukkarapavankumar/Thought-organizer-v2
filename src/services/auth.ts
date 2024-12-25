import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface AuthService {
  getCurrentUser: () => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

export const auth: AuthService = {
  async getCurrentUser() {
    if (!supabase) return null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id || null;
    } catch {
      return null;
    }
  },

  async signIn(email: string, password: string) {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return null;
      return data.user?.id || null;
    } catch {
      return null;
    }
  },

  async signOut() {
    if (!supabase) return;
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore signOut errors
    }
  }
};