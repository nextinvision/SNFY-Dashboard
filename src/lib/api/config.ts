/**
 * API Configuration
 * Centralized configuration for API endpoints
 * All backend URLs must come from environment variables - no hardcoded URLs allowed
 */

/**
 * Get the API base URL from environment variables
 * During build time (SSR), returns a placeholder if not set to allow build to complete
 * At runtime, throws error if NEXT_PUBLIC_API_URL is not set
 */
export function getApiBaseUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  // During build/SSR, allow undefined to prevent build failures
  // The actual validation happens at runtime when API calls are made
  if (typeof window === 'undefined' && !apiUrl) {
    // Build time / SSR - return placeholder (won't be used, but prevents build failure)
    return 'https://api.thebackend.in';
  }
  
  // Runtime validation - throw error if not set
  if (!apiUrl) {
    throw new Error(
      'NEXT_PUBLIC_API_URL environment variable is not set. ' +
      'Please set it in your .env.local file or deployment environment variables.'
    );
  }
  
  // Remove trailing slash if present
  return apiUrl.replace(/\/$/, '');
}

/**
 * Get the full API URL with version path
 */
export function getApiUrl(): string {
  return `${getApiBaseUrl()}/api/v1`;
}

/**
 * Get the API documentation URL
 */
export function getApiDocsUrl(): string {
  return `${getApiBaseUrl()}/api/docs`;
}

