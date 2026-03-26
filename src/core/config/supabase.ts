/**
 * Supabase Configuration
 * Handles Supabase client configuration for different environments
 */

interface SupabaseConfig {
  url: string;
  anonKey: string;
}

/**
 * Get Supabase configuration from environment variables.
 * Throws if variables are missing to prevent DNS squatting and silent misconfiguration.
 */
export const getSupabaseConfig = (): SupabaseConfig => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing required environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set'
    );
  }

  return { url: supabaseUrl, anonKey: supabaseAnonKey };
};

/**
 * Default Supabase configuration instance
 */
export const supabaseConfig = getSupabaseConfig();
