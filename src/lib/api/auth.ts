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
    
    const response = await apiClient.post<AuthResponse>(
      '/auth/login',
      credentials,
      false, // Don't include auth token for login
    );

    // Store token and user info
    apiClient.setAuthToken(response.accessToken);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(response.user));
    }

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

