/**
 * Authentication API Service
 */

import { apiClient } from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'administrator' | 'author';
}

export interface AuthResponse {
  accessToken: string;
  expiresIn: string;
  user: User;
}

export const authApi = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    // Refresh CSRF token before login
    await apiClient.refreshCsrfToken();
    
    let response: AuthResponse;
    try {
      response = await apiClient.post<AuthResponse>(
        '/auth/login',
        credentials,
        false, // Don't include auth token for login
      );
    } catch (error) {
      // Log the actual error for debugging
      if (process.env.NODE_ENV === 'development') {
        console.error('Login API call failed:', error);
      }
      throw error;
    }

    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Login response received:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', response ? Object.keys(response) : 'null');
    }

    // Validate response structure
    if (!response) {
      throw new Error('Invalid login response: response is null or undefined');
    }

    if (!response.accessToken || typeof response.accessToken !== 'string') {
      console.error('Invalid response structure - missing accessToken:', {
        response,
        hasAccessToken: 'accessToken' in response,
        accessTokenType: typeof response.accessToken,
      });
      throw new Error('Invalid login response: missing or invalid accessToken');
    }

    if (!response.user || !response.user.id) {
      console.error('Invalid response structure - missing user:', {
        response,
        hasUser: 'user' in response,
        user: response.user,
      });
      throw new Error('Invalid login response: missing or invalid user data');
    }

    // Store token and user info synchronously
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('auth_token', response.accessToken);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Verify storage
        const storedToken = localStorage.getItem('auth_token');
        if (storedToken !== response.accessToken) {
          throw new Error('Failed to store authentication token in localStorage');
        }
      } catch (storageError) {
        console.error('localStorage error:', storageError);
        throw new Error('Failed to store authentication data. Please check browser settings.');
      }
    }

    // Also set via API client for consistency
    apiClient.setAuthToken(response.accessToken);

    return response;
  },

  logout(): void {
    apiClient.clearAuthToken();
  },

  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('auth_token');
  },
};

