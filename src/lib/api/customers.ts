/**
 * Customers API Service
 */

import { apiClient } from './client';
import type { Customer, CustomerListQuery, CustomerListResponse } from '../types/customer';

interface CustomerApiResponse {
  id: string;
  name: string;
  email: string;
  phone?: string;
  username: string;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

interface CustomerListApiResponse {
  data: CustomerApiResponse[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const transformCustomer = (data: CustomerApiResponse): Customer => {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    username: data.username,
    emailVerified: data.emailVerified,
    isActive: data.isActive,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    lastLoginAt: data.lastLoginAt,
  };
};

export const customersApi = {
  async list(query: CustomerListQuery = {}): Promise<CustomerListResponse> {
    const params = new URLSearchParams();
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.search) params.append('search', query.search);
    if (query.emailVerified !== undefined) {
      params.append('emailVerified', query.emailVerified.toString());
    }
    if (query.isActive !== undefined) {
      params.append('isActive', query.isActive.toString());
    }

    const response = await apiClient.get<CustomerListApiResponse>(
      `/customers?${params.toString()}`,
    );

    return {
      data: response.data.map(transformCustomer),
      pagination: response.pagination,
    };
  },

  async getById(id: string): Promise<Customer> {
    const response = await apiClient.get<CustomerApiResponse>(`/customers/${id}`);
    return transformCustomer(response);
  },
};

