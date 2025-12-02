export interface Article {
  id: string;
  feedId: string;
  title: string;
  description?: string;
  link: string;
  publishedAt?: string;
  author?: string;
  categories: string[];
  imageUrl?: string;
  content?: string;
  guid?: string;
  createdAt: string;
  updatedAt: string;
  feedName?: string; // For display in article lists
}

export interface ArticleListQuery {
  page?: number;
  limit?: number;
  search?: string;
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

export interface ArticleListResponse {
  data: Article[];
  pagination: PaginationMeta;
}

