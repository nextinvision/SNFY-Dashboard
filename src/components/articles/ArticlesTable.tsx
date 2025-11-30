'use client';

import { useEffect, useState } from 'react';
import type { Article, ArticleListQuery } from '@/lib/types/article';
import { formatDate, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/ui/search-bar';
import { Pagination } from '@/components/ui/pagination';
import { articlesApi } from '@/lib/api/articles';
import { ApiClientError } from '@/lib/api/client';

type SortOrder = 'newest' | 'oldest';

interface ArticlesTableProps {
  feedId: string;
  feedName?: string;
  initialArticles?: Article[];
  initialTotal?: number;
}

export function ArticlesTable({
  feedId,
  feedName,
  initialArticles = [],
  initialTotal = 0,
}: ArticlesTableProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [total, setTotal] = useState(initialTotal);
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const perPage = 20;

  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await articlesApi.listByFeed(feedId, {
          page,
          limit: perPage,
          search: search || undefined,
          sortBy: sortOrder,
        });
        setArticles(response.data);
        setTotal(response.total);
      } catch (err) {
        if (err instanceof ApiClientError) {
          setError(err.message || 'Failed to load articles');
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [feedId, page, search, sortOrder, perPage]);

  const pageCount = Math.max(1, Math.ceil(total / perPage));

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <div className="font-medium">Error</div>
          <div className="mt-1">{error}</div>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-sm">
          <SearchBar
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            placeholder="Search articles..."
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={sortOrder === 'newest' ? 'primary' : 'secondary'}
            onClick={() => {
              setSortOrder('newest');
              setPage(1);
            }}
            className="text-xs sm:text-sm"
          >
            Newest First
          </Button>
          <Button
            variant={sortOrder === 'oldest' ? 'primary' : 'secondary'}
            onClick={() => {
              setSortOrder('oldest');
              setPage(1);
            }}
            className="text-xs sm:text-sm"
          >
            Oldest First
          </Button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700">
                  Article
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700">
                  Author
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700">
                  Published
                </th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-zinc-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-12 text-center text-sm text-zinc-500"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900"></div>
                      <span>Loading articles...</span>
                    </div>
                  </td>
                </tr>
              ) : articles.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-12 text-center text-sm text-zinc-500"
                  >
                    {search
                      ? 'No articles match your search.'
                      : 'No articles found. Refresh the feed to fetch articles.'}
                  </td>
                </tr>
              ) : (
                articles.map((article) => (
                  <tr
                    key={article.id}
                    className="transition-colors hover:bg-zinc-50"
                  >
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-zinc-900">
                          {article.title}
                        </span>
                        {article.description && (
                          <span className="mt-1 line-clamp-2 text-xs text-zinc-500">
                            {article.description}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-zinc-600">
                      {article.author || '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-zinc-600">
                      {article.publishedAt
                        ? formatDate(article.publishedAt)
                        : '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => window.open(article.link, '_blank')}
                          className="text-xs sm:text-sm"
                        >
                          View
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!isLoading && articles.length > 0 && (
        <div className="flex justify-end">
          <Pagination
            page={page}
            pageCount={pageCount}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}

