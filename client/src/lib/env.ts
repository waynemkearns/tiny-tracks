/**
 * Environment configuration with sensible defaults
 * Allows for environment-specific configurations across development, testing, and production
 */

interface EnvConfig {
  apiBaseUrl: string;
  isProduction: boolean;
  isDevelopment: boolean;
  appVersion: string;
  featureFlags: {
    enablePregnancyTracking: boolean;
    enableDataExport: boolean;
    enableFeedbackForm: boolean;
  };
}

const getEnvironment = (): string => {
  // In test/Node environments, import.meta.env is not available
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.MODE || 'development';
  }
  return process.env.NODE_ENV || 'development';
};

const isProduction = getEnvironment() === 'production';
const isDevelopment = getEnvironment() === 'development';

export const envConfig: EnvConfig = {
  apiBaseUrl: isProduction 
    ? '' // Use relative URLs in production (same domain)
    : 'http://localhost:3000',
  isProduction,
  isDevelopment,
  appVersion: '1.1.0',
  featureFlags: {
    enablePregnancyTracking: true,
    enableDataExport: isProduction ? false : true, // Only enable in development for now
    enableFeedbackForm: isProduction, // Only in production
  }
};

export default envConfig;
