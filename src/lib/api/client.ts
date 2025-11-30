/**
 * API Client for SNFYI Backend
 * Handles all HTTP requests, authentication, CSRF tokens, and error handling
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

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
        const response = await fetch(`${this.baseUrl}/auth/csrf-token`, {
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
        // Backend wraps errors in { success: false, message, statusCode, ... }
        errorData = {
          message: errorResponse.message || response.statusText || 'An error occurred',
          statusCode: errorResponse.statusCode || response.status,
          error: errorResponse.error,
        };
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

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return {} as T;
    }

    const jsonResponse = await response.json();
    
    // Backend wraps all successful responses in { success: true, data: {...}, ... }
    // Unwrap the data field to get the actual response
    if (jsonResponse && typeof jsonResponse === 'object' && 'data' in jsonResponse && jsonResponse.success === true) {
      return jsonResponse.data as T;
    }

    // If response is not wrapped (e.g., CSRF token endpoint uses res.json() directly), return as-is
    return jsonResponse as T;
  }

  async get<T>(endpoint: string, includeAuth = true): Promise<T> {
    // Load CSRF token if needed (client-side only)
    await this.loadCsrfToken();

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(includeAuth),
      credentials: 'include',
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: unknown, includeAuth = true): Promise<T> {
    // Load CSRF token if needed (client-side only)
    await this.loadCsrfToken();

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
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

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
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

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
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

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
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

