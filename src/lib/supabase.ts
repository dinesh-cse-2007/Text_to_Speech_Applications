import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface TTSHistoryEntry {
  id: string;
  text: string;
  voice_name: string;
  rate: number;
  pitch: number;
  volume: number;
  created_at: string;
}
