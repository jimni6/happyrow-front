/**
 * API Configuration
 * Handles different API base URLs for development and production environments
 */

interface ApiConfig {
  baseUrl: string;
}

/**
 * Get API configuration based on environmen
 * - Development: Uses proxy configuration (/api -> backend)
 * - Production: Direct URL to backend service
 */
export const getApiConfig = (): ApiConfig => {
  const isProduction = import.meta.env.PROD;
  const envApiUrl = import.meta.env.VITE_API_BASE_URL;

  if (envApiUrl) {
    return { baseUrl: envApiUrl };
  }

  if (isProduction) {
    return { baseUrl: 'https://happyrow-core.onrender.com' };
  } else {
    return { baseUrl: '/api' };
  }
};

/**
 * Default API configuration instance
 */
export const apiConfig = getApiConfig();
