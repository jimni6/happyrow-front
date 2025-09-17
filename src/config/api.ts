/**
 * API Configuration for React Native/Expo
 * Handles different API base URLs for development and production environments
 */

interface ApiConfig {
  baseUrl: string;
}

/**
 * Get API configuration based on environment
 * - Development: Direct URL to backend service (no proxy in React Native)
 * - Production: Direct URL to backend service
 */
export const getApiConfig = (): ApiConfig => {
  // In React Native/Expo, we use process.env instead of import.meta.env
  const isDevelopment = __DEV__;
  const envApiUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  
  if (envApiUrl) {
    // Use environment variable if provided
    return { baseUrl: envApiUrl };
  }
  
  // Both development and production use direct URL in React Native
  // (no proxy configuration like in web development)
  return { baseUrl: 'https://happyrow-core.onrender.com' };
};

/**
 * Default API configuration instance
 */
export const apiConfig = getApiConfig();
