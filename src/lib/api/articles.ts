/**
 * Articles API Service
 */

import { apiClient } from './client';
import type {
  Article,
  ArticleListQuery,
  ArticleListResponse,
} from '../types/article';

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

    const response = await apiClient.get<{
      data: any[];
      total: number;
      page: number;
      limit: number;
    }>(`/feeds/${feedId}/articles?${params.toString()}`);

    return {
      ...response,
      data: response.data.map(transformArticle),
    };
  },

  async getById(articleId: string): Promise<Article> {
    const response = await apiClient.get<any>(`/articles/${articleId}`);
    return transformArticle(response);
  },
};

function transformArticle(backendArticle: any): Article {
  return {
    id: backendArticle.id,
    feedId: backendArticle.feedId,
    title: backendArticle.title,
    description: backendArticle.description,
    link: backendArticle.link,
    publishedAt: backendArticle.publishedAt
      ? new Date(backendArticle.publishedAt).toISOString()
      : undefined,
    author: backendArticle.author,
    categories: backendArticle.categories,
    imageUrl: backendArticle.imageUrl,
    content: backendArticle.content,
    guid: backendArticle.guid,
    createdAt: backendArticle.createdAt
      ? new Date(backendArticle.createdAt).toISOString()
      : new Date().toISOString(),
    updatedAt: backendArticle.updatedAt
      ? new Date(backendArticle.updatedAt).toISOString()
      : new Date().toISOString(),
  };
}

