/**
 * API Client for SNFYI Backend
 * Handles all HTTP requests, authentication, CSRF tokens, and error handling
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const API_VERSION = '/api/v1';

export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}

export class ApiClientError extends Error {
  statusCode?: number;
  error?: string;

  constructor(message: string, statusCode?: number, error?: string) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
    this.error = error;
  }
}

class ApiClient {
  private baseUrl: string;
  private csrfToken: string | null = null;
  private csrfTokenPromise: Promise<void> | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Don't load CSRF token during module initialization (build time)
    // Only load when actually needed (client-side)
  }

  private async loadCsrfToken(): Promise<void> {
    // Skip CSRF token loading during SSR/build time
    if (typeof window === 'undefined') {
      return;
    }

    // If already loading, return the existing promise
    if (this.csrfTokenPromise) {
      return this.csrfTokenPromise;
    }

    // If already loaded, skip
    if (this.csrfToken) {
      return;
    }

    this.csrfTokenPromise = (async () => {
      try {
        const response = await fetch(`${this.baseUrl}${API_VERSION}/auth/csrf-token`, {
          method: 'GET',
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          this.csrfToken = data.csrfToken || null;
        }
      } catch (error) {
        // CSRF token fetch failed, continue without it
        // Only log in development to avoid build-time noise
        if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to load CSRF token:', error);
        }
      } finally {
        this.csrfTokenPromise = null;
      }
    })();

    return this.csrfTokenPromise;
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  private getHeaders(includeAuth = true, contentType = 'application/json'): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': contentType,
    };

    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    if (this.csrfToken) {
      headers['X-CSRF-Token'] = this.csrfToken;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorData: ApiError;
      try {
        const errorResponse = await response.json();
        // REST-compliant error format: { error: { code, message, details? } }
        if (
          errorResponse &&
          typeof errorResponse === 'object' &&
          'error' in errorResponse &&
          typeof errorResponse.error === 'object'
        ) {
          const errorObj = errorResponse.error as { code?: string; message?: string; details?: unknown };
          errorData = {
            message: errorObj.message || response.statusText || 'An error occurred',
            statusCode: response.status,
            error: errorObj.code || errorObj.details as string,
          };
        } else {
          // Fallback for non-standard error formats
          errorData = {
            message: (errorResponse as { message?: string })?.message || response.statusText || 'An error occurred',
            statusCode: (errorResponse as { statusCode?: number })?.statusCode || response.status,
            error: (errorResponse as { error?: string })?.error,
          };
        }
      } catch {
        errorData = {
          message: response.statusText || 'An error occurred',
          statusCode: response.status,
        };
      }

      // Handle 401 Unauthorized - clear token and redirect to login
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }

      throw new ApiClientError(
        errorData.message || 'An error occurred',
        errorData.statusCode || response.status,
        errorData.error,
      );
    }

    // Handle 204 No Content (DELETE endpoints) - no body to parse
    if (response.status === 204) {
      return {} as T;
    }

    // Handle empty responses or non-JSON content
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return {} as T;
    }

    // Check if response has content before parsing
    const contentLength = response.headers.get('content-length');
    if (contentLength === '0') {
      return {} as T;
    }

    let jsonResponse: unknown;
    try {
      const text = await response.text();
      if (!text || text.trim() === '') {
        return {} as T;
      }
      jsonResponse = JSON.parse(text);
    } catch (parseError) {
      // If JSON parsing fails, log error in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to parse JSON response:', parseError);
      }
      return {} as T;
    }
    
    // REST-compliant: Backend returns resources directly (no wrapper)
    // Paginated responses: { data: [...], pagination: {...} }
    // Single resources: Direct resource object
    // Return response as-is
    return jsonResponse as T;
  }

  async get<T>(endpoint: string, includeAuth = true): Promise<T> {
    // Load CSRF token if needed (client-side only)
    await this.loadCsrfToken();

    const response = await fetch(`${this.baseUrl}${API_VERSION}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(includeAuth),
      credentials: 'include',
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: unknown, includeAuth = true): Promise<T> {
    // Load CSRF token if needed (client-side only)
    await this.loadCsrfToken();

    const response = await fetch(`${this.baseUrl}${API_VERSION}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(includeAuth),
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include',
    });

    return this.handleResponse<T>(response);
  }

  async patch<T>(endpoint: string, data?: unknown, includeAuth = true): Promise<T> {
    // Load CSRF token if needed (client-side only)
    await this.loadCsrfToken();

    const response = await fetch(`${this.baseUrl}${API_VERSION}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(includeAuth),
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include',
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string, includeAuth = true): Promise<T> {
    // Load CSRF token if needed (client-side only)
    await this.loadCsrfToken();

    const response = await fetch(`${this.baseUrl}${API_VERSION}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(includeAuth),
      credentials: 'include',
    });

    return this.handleResponse<T>(response);
  }

  async uploadFile<T>(endpoint: string, file: File, includeAuth = true): Promise<T> {
    // Load CSRF token if needed (client-side only)
    await this.loadCsrfToken();

    const formData = new FormData();
    formData.append('file', file);

    const headers: HeadersInit = {};

    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    if (this.csrfToken) {
      headers['X-CSRF-Token'] = this.csrfToken;
    }

    const response = await fetch(`${this.baseUrl}${API_VERSION}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include',
    });

    return this.handleResponse<T>(response);
  }

  setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  clearAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  }

  async refreshCsrfToken(): Promise<void> {
    // Reset token to force reload
    this.csrfToken = null;
    this.csrfTokenPromise = null;
    return this.loadCsrfToken();
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

