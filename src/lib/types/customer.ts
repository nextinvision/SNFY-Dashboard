export interface Customer {
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

export interface CustomerListQuery {
  page?: number;
  limit?: number;
  search?: string;
  emailVerified?: boolean;
  isActive?: boolean;
}

export interface CustomerListResponse {
  data: Customer[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

