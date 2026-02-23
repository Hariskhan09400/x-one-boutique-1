import { createClient } from '@supabase/supabase-js';

// Apne Supabase credentials yahan dalo
const supabaseUrl = 'https://oaonaiocrkujucaepefk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hb25haW9jcmt1anVjYWVwZWZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NTEwNDcsImV4cCI6MjA4NzQyNzA0N30.FrvBV8S_ztH_bJr9O_or1DLRjZF6GR2or6UkmrTyXTE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);