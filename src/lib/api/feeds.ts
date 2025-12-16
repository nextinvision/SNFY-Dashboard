/**
 * Feeds API Service
 */

import { apiClient } from './client';
import type { Feed } from '../types/feed';

export interface CreateFeedRequest {
  name: string;
  url: string;
  logoUrl?: string;
  industries: string[]; // Industry IDs
  autoUpdate?: boolean;
  fullText?: boolean;
  enabled?: boolean;
  // Contact method fields (Google News Policy requirement - at least one required)
  publisherWebsite?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactPageUrl?: string;
}

export interface UpdateFeedRequest extends Partial<CreateFeedRequest> {}

export interface ToggleFeedRequest {
  enabled: boolean;
}

export interface FeedListQuery {
  page?: number;
  limit?: number;
  search?: string;
  enabled?: string; // 'true' | 'false'
  sortBy?: 'newest' | 'oldest';
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface FeedListResponse {
  data: Feed[];
  pagination: PaginationMeta;
}

export interface RefreshFeedResponse {
  success: boolean;
  articlesProcessed: number;
  articlesCreated: number;
  articlesSkipped: number;
  error?: string;
}

// Transform backend feed format to frontend format
function transformFeed(backendFeed: any): Feed {
  // Handle nested industry structure from backend
  let industries: any[] = [];
  if (backendFeed.industries) {
    industries = backendFeed.industries.map((fi: any) => {
      // Backend returns FeedIndustry entities with nested industry
      if (fi.industry) {
        return {
          id: fi.industry.id,
          name: fi.industry.name,
        };
      }
      // Fallback if structure is different
      return {
        id: fi.industryId || fi.id,
        name: fi.name || '',
      };
    });
  }

  return {
    id: backendFeed.id,
    name: backendFeed.name,
    url: backendFeed.url,
    logo: backendFeed.logoUrl,
    industries,
    autoUpdate: backendFeed.autoUpdate ?? true,
    fullText: backendFeed.fullText ?? false,
    status: backendFeed.enabled ? 'enabled' : 'disabled',
    lastUpdated: backendFeed.lastUpdatedAt || backendFeed.updatedAt || backendFeed.createdAt,
    // Contact method fields
    publisherWebsite: backendFeed.publisherWebsite || undefined,
    contactEmail: backendFeed.contactEmail || undefined,
    contactPhone: backendFeed.contactPhone || undefined,
    contactPageUrl: backendFeed.contactPageUrl || undefined,
  };
}

export const feedsApi = {
  async list(query: FeedListQuery = {}): Promise<FeedListResponse> {
    const params = new URLSearchParams();
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.search) params.append('search', query.search);
    if (query.enabled) params.append('enabled', query.enabled);
    if (query.sortBy) {
      // Backend expects 'newest' or 'oldest'
      params.append('sortBy', query.sortBy);
    }

    // REST-compliant response: { data: [...], pagination: {...} }
    const response = await apiClient.get<{ data: any[]; pagination: PaginationMeta }>(
      `/feeds?${params.toString()}`,
    );

    return {
      data: response.data.map(transformFeed),
      pagination: response.pagination,
    };
  },

  async getById(id: string): Promise<Feed> {
    const response = await apiClient.get<any>(`/feeds/${id}`);
    return transformFeed(response);
  },

  async create(data: CreateFeedRequest): Promise<Feed> {
    const response = await apiClient.post<any>('/feeds', data);
    return transformFeed(response);
  },

  async update(id: string, data: UpdateFeedRequest): Promise<Feed> {
    const response = await apiClient.patch<any>(`/feeds/${id}`, data);
    return transformFeed(response);
  },

  async toggle(id: string, enabled: boolean): Promise<Feed> {
    const response = await apiClient.patch<any>(`/feeds/${id}/toggle`, { enabled });
    return transformFeed(response);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/feeds/${id}`);
  },

  async refresh(id: string): Promise<RefreshFeedResponse> {
    const response = await apiClient.post<RefreshFeedResponse>(
      `/feeds/${id}/refresh`,
    );
    return response;
  },

  async bulkCreate(
    feeds: Array<{
      name: string;
      url: string;
      logoUrl?: string;
      industries: string[];
      autoUpdate?: boolean;
      fullText?: boolean;
      enabled?: boolean;
      // Contact method fields (at least one required)
      publisherWebsite?: string;
      contactEmail?: string;
      contactPhone?: string;
      contactPageUrl?: string;
    }>,
  ): Promise<{
    success: boolean;
    created: number;
    failed: number;
    results: {
      created: any[];
      failed: Array<{ feed: any; error: string }>;
    };
  }> {
    const response = await apiClient.post<any>('/feeds/bulk', { feeds });
    return response;
  },
};

