export interface Article {
  id: string;
  feedId: string;
  title: string;
  description?: string;
  link: string;
  publishedAt?: string;
  author?: string;
  categories?: string;
  imageUrl?: string;
  content?: string;
  guid?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleListQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'newest' | 'oldest';
}

export interface ArticleListResponse {
  data: Article[];
  total: number;
  page: number;
  limit: number;
}

