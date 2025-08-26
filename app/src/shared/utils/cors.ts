// CORS Configuration Utilities
// Frontend CORS handling and request configuration

/**
 * CORS configuration for development and production
 */
export const corsConfig = {
  development: {
    allowedOrigins: [
      'http://localhost:3000',
      'http://localhost:5173', // Vite dev server
      'http://127.0.0.1:5173',
    ],
    allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
  },
  production: {
    allowedOrigins: [import.meta.env.VITE_FRONTEND_URL || 'https://your-domain.com'],
    allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  },
};

/**
 * Get CORS configuration based on environment
 */
export const getCorsConfig = () => {
  const isDevelopment = import.meta.env.DEV;
  return isDevelopment ? corsConfig.development : corsConfig.production;
};

/**
 * Check if origin is allowed for CORS
 */
export const isOriginAllowed = (origin: string): boolean => {
  const config = getCorsConfig();
  return config.allowedOrigins.includes(origin);
};

/**
 * Get headers for cross-origin requests
 * Note: CORS headers are set by the server, not the client
 */
export const getCorsHeaders = (): Record<string, string> => {
  // Client should not set CORS headers - these are server-side only
  return {};
};

/**
 * Middleware function to add standard headers to fetch requests
 */
export const withCorsHeaders = (headers: Record<string, string> = {}): Record<string, string> => {
  // Only add standard request headers, not CORS headers
  return headers;
};

/**
 * Handle preflight CORS request
 */
export const handlePreflightRequest = (method: string, headers: string[]): boolean => {
  const config = getCorsConfig();

  const isMethodAllowed = config.allowedMethods.includes(method.toUpperCase());
  const areHeadersAllowed = headers.every(header => config.allowedHeaders.includes(header));

  return isMethodAllowed && areHeadersAllowed;
};

/**
 * Create fetch options with CORS configuration
 */
export const createCorsRequestOptions = (options: RequestInit = {}): RequestInit => {
  return {
    ...options,
    mode: 'cors' as RequestMode,
    credentials: 'include' as RequestCredentials,
    headers: {
      ...options.headers,
    },
  };
};
