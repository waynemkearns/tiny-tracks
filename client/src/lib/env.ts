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
  return import.meta.env.MODE || process.env.NODE_ENV || 'development';
};

const isProduction = getEnvironment() === 'production';
const isDevelopment = getEnvironment() === 'development';

export const envConfig: EnvConfig = {
  apiBaseUrl: isProduction 
    ? 'https://api.tinytracks.app' 
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
