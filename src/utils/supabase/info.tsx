// Supabase configuration - now using environment variables for security
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.'
  );
}

// Extract project ID from URL for backward compatibility
export const projectId = SUPABASE_URL.replace('https://', '').split('.')[0];
export const publicAnonKey = SUPABASE_ANON_KEY;