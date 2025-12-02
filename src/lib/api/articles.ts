/**
 * Articles API Service
 */

import { apiClient } from './client';
import type {
  Article,
  ArticleListQuery,
  ArticleListResponse,
} from '../types/article';

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const articlesApi = {
  async listByFeed(
    feedId: string,
    query: ArticleListQuery = {},
  ): Promise<ArticleListResponse> {
    const params = new URLSearchParams();
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.search) params.append('search', query.search);
    if (query.sortBy) {
      params.append('sortBy', query.sortBy);
    }

    // REST-compliant response: { data: [...], pagination: {...} }
    const response = await apiClient.get<{
      data: unknown[];
      pagination: PaginationMeta;
    }>(`/feeds/${feedId}/articles?${params.toString()}`);

    return {
      data: response.data.map((item) => transformArticle(item as Record<string, unknown>)),
      pagination: response.pagination,
    };
  },

  async getById(articleId: string): Promise<Article> {
    const response = await apiClient.get<Record<string, unknown>>(`/articles/${articleId}`);
    return transformArticle(response);
  },
};

function transformArticle(backendArticle: Record<string, unknown>): Article {
  // Handle categories - backend stores as comma-separated string
  let categories: string[] = [];
  if (backendArticle.categories) {
    if (typeof backendArticle.categories === 'string') {
      categories = backendArticle.categories.split(',').map((c: string) => c.trim()).filter(Boolean);
    } else if (Array.isArray(backendArticle.categories)) {
      categories = backendArticle.categories.map((c) => String(c));
    }
  }

  const feed = backendArticle.feed as Record<string, unknown> | undefined;

  return {
    id: String(backendArticle.id || ''),
    feedId: String(backendArticle.feedId || ''),
    title: String(backendArticle.title || ''),
    description: backendArticle.description ? String(backendArticle.description) : undefined,
    link: String(backendArticle.link || ''),
    publishedAt: backendArticle.publishedAt
      ? new Date(String(backendArticle.publishedAt)).toISOString()
      : undefined,
    author: backendArticle.author ? String(backendArticle.author) : undefined,
    categories,
    imageUrl: backendArticle.imageUrl ? String(backendArticle.imageUrl) : undefined,
    content: backendArticle.content ? String(backendArticle.content) : undefined,
    guid: backendArticle.guid ? String(backendArticle.guid) : undefined,
    createdAt: backendArticle.createdAt
      ? new Date(String(backendArticle.createdAt)).toISOString()
      : new Date().toISOString(),
    updatedAt: backendArticle.updatedAt
      ? new Date(String(backendArticle.updatedAt)).toISOString()
      : new Date().toISOString(),
    feedName: feed?.name ? String(feed.name) : undefined,
  };
}

