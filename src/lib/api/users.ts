/**
 * Users API Service
 */

import { apiClient } from './client';
import type { User } from '../types/user';

export interface UserListQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface UserListResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
}

// Transform backend user format to frontend format
function transformUser(backendUser: any): User {
  return {
    id: backendUser.id,
    name: backendUser.name,
    email: backendUser.email,
    role: backendUser.role,
    isActive: backendUser.isActive ?? true,
    lastLoginAt: backendUser.lastLoginAt,
    createdAt: backendUser.createdAt,
  };
}

export const usersApi = {
  async list(query: UserListQuery = {}): Promise<UserListResponse> {
    const params = new URLSearchParams();
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.search) params.append('search', query.search);

    const response = await apiClient.get<{ data: any[]; total: number; page: number; limit: number }>(
      `/users?${params.toString()}`,
    );

    return {
      ...response,
      data: response.data.map(transformUser),
    };
  },
};

