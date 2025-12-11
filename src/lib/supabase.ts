import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://xwidcalxywyvltxolmbr.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3aWRjYWx4eXd5dmx0eG9sbWJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNDYwNDAsImV4cCI6MjA3OTcyMjA0MH0.Cggvskscbo8cZvUl_10iKMZrF0xtqewA2dTVHqaowT8";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
