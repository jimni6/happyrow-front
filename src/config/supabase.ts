/**
 * Supabase Configuration
 * Handles Supabase client configuration for different environments
 */

interface SupabaseConfig {
  url: string;
  anonKey: string;
}

/**
 * Get Supabase configuration from environment variables
 * Returns default values if environment variables are not set (for development)
 */
export const getSupabaseConfig = (): SupabaseConfig => {
  // @ts-expect-error - Vite provides this at build time
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  // @ts-expect-error - Vite provides this at build time
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Use placeholder values if environment variables are not set
  // This prevents the app from crashing during development
  return {
    url: supabaseUrl || 'https://placeholder.supabase.co',
    anonKey: supabaseAnonKey || 'placeholder-anon-key',
  };
};

/**
 * Default Supabase configuration instance
 */
export const supabaseConfig = getSupabaseConfig();
