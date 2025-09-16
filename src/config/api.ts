/**
 * API Configuration
 * Handles different API base URLs for development and production environments
 */

interface ApiConfig {
  baseUrl: string;
}

/**
 * Get API configuration based on environment
 * - Development: Uses proxy configuration (/api -> backend)
 * - Production: Direct URL to backend service
 */
export const getApiConfig = (): ApiConfig => {
  // For Vite, we can use import.meta.env with proper typing
  // @ts-ignore - Vite provides this at build time
  const isProduction = import.meta.env.PROD;
  // @ts-ignore - Vite provides this at build time
  const envApiUrl = import.meta.env.VITE_API_BASE_URL;
  
  if (envApiUrl) {
    // Use environment variable if provided
    return { baseUrl: envApiUrl };
  }
  
  if (isProduction) {
    // Production: Direct URL to backend
    return { baseUrl: 'https://happyrow-core.onrender.com' };
  } else {
    // Development: Use proxy configuration
    return { baseUrl: '/api' };
  }
};

/**
 * Default API configuration instance
 */
export const apiConfig = getApiConfig();
