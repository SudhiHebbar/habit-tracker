// Environment configuration utility
// Provides type-safe access to environment variables

export interface EnvConfig {
  // API Configuration
  API_BASE_URL: string;
  API_TIMEOUT: number;

  // Feature Flags
  FEATURE_ANALYTICS: boolean;
  FEATURE_DEBUG: boolean;
  FEATURE_MOCK_API: boolean;

  // Application Configuration
  APP_NAME: string;
  APP_VERSION: string;
  APP_ENVIRONMENT: 'development' | 'production' | 'local' | 'staging';

  // UI Configuration
  DEFAULT_THEME: 'light' | 'dark';
  ENABLE_ANIMATIONS: boolean;
  MAX_HABITS_PER_TRACKER: number;
  MAX_TRACKERS_PER_USER: number;

  // Development Tools
  REACT_DEVTOOLS: boolean;
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[`VITE_${key}`];
  if (value === undefined && defaultValue === undefined) {
    console.warn(`Environment variable VITE_${key} is not defined`);
    return '';
  }
  return value ?? defaultValue ?? '';
};

const getEnvBoolean = (key: string, defaultValue = false): boolean => {
  const value = getEnvVar(key);
  return value ? value.toLowerCase() === 'true' : defaultValue;
};

const getEnvNumber = (key: string, defaultValue = 0): number => {
  const value = getEnvVar(key);
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Create environment configuration object
export const env: EnvConfig = {
  // API Configuration
  API_BASE_URL: getEnvVar('API_BASE_URL', 'http://localhost:5000/api'),
  API_TIMEOUT: getEnvNumber('API_TIMEOUT', 10000),

  // Feature Flags
  FEATURE_ANALYTICS: getEnvBoolean('FEATURE_ANALYTICS', true),
  FEATURE_DEBUG: getEnvBoolean('FEATURE_DEBUG', false),
  FEATURE_MOCK_API: getEnvBoolean('FEATURE_MOCK_API', false),

  // Application Configuration
  APP_NAME: getEnvVar('APP_NAME', 'Habit Tracker'),
  APP_VERSION: getEnvVar('APP_VERSION', '1.0.0'),
  APP_ENVIRONMENT: getEnvVar('APP_ENVIRONMENT', 'development') as EnvConfig['APP_ENVIRONMENT'],

  // UI Configuration
  DEFAULT_THEME: getEnvVar('DEFAULT_THEME', 'light') as EnvConfig['DEFAULT_THEME'],
  ENABLE_ANIMATIONS: getEnvBoolean('ENABLE_ANIMATIONS', true),
  MAX_HABITS_PER_TRACKER: getEnvNumber('MAX_HABITS_PER_TRACKER', 500),
  MAX_TRACKERS_PER_USER: getEnvNumber('MAX_TRACKERS_PER_USER', 50),

  // Development Tools
  REACT_DEVTOOLS: getEnvBoolean('REACT_DEVTOOLS', false),
  LOG_LEVEL: getEnvVar('LOG_LEVEL', 'info') as EnvConfig['LOG_LEVEL'],
};

// Helper functions
export const isDevelopment = () => env.APP_ENVIRONMENT === 'development';
export const isProduction = () => env.APP_ENVIRONMENT === 'production';
export const isLocal = () => env.APP_ENVIRONMENT === 'local';
export const isStaging = () => env.APP_ENVIRONMENT === 'staging';

// Validation function to ensure all required environment variables are set
export const validateEnv = (): boolean => {
  const requiredVars = ['API_BASE_URL', 'APP_NAME', 'APP_VERSION'];
  const missingVars = requiredVars.filter(key => !getEnvVar(key));

  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
    return false;
  }

  return true;
};

// Initialize and validate environment on module load
if (!validateEnv() && isProduction()) {
  throw new Error('Invalid environment configuration');
}

export default env;
