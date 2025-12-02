/**
 * Users API Service
 */

import { apiClient } from './client';
import type { User, UserRole } from '../types/user';

export interface UserListQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface UserListResponse {
  data: User[];
  pagination: PaginationMeta;
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

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export const usersApi = {
  async list(query: UserListQuery = {}): Promise<UserListResponse> {
    const params = new URLSearchParams();
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.search) params.append('search', query.search);

    // REST-compliant response: { data: [...], pagination: {...} }
    const response = await apiClient.get<{ data: any[]; pagination: PaginationMeta }>(
      `/users?${params.toString()}`,
    );

    return {
      data: response.data.map(transformUser),
      pagination: response.pagination,
    };
  },

  async create(data: CreateUserRequest): Promise<User> {
    const response = await apiClient.post<any>('/users', data);
    return transformUser(response);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },
};

