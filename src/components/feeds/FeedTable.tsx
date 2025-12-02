'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Feed } from "@/lib/types/feed";
import { formatDate, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/ui/search-bar";
import { Pagination } from "@/components/ui/pagination";
import { Modal } from "@/components/ui/modal";
import { feedsApi } from "@/lib/api/feeds";
import { ApiClientError } from "@/lib/api/client";

type SortOrder = "newest" | "oldest";

interface FeedTableProps {
  initialFeeds?: Feed[];
  initialTotal?: number;
}

export function FeedTable({ initialFeeds = [], initialTotal = 0 }: FeedTableProps) {
  const router = useRouter();
  const [feeds, setFeeds] = useState<Feed[]>(initialFeeds);
  const [total, setTotal] = useState(initialTotal);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [page, setPage] = useState(1);
  const [targetFeed, setTargetFeed] = useState<Feed | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());
  const [refreshingIds, setRefreshingIds] = useState<Set<string>>(new Set());

  const perPage = 10;

  // Fetch feeds when search, sort, or page changes
  useEffect(() => {
    const fetchFeeds = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await feedsApi.list({
          page,
          limit: perPage,
          search: search || undefined,
          sortBy: sortOrder,
        });
        setFeeds(response.data);
        setTotal(response.pagination.total);
      } catch (err) {
        if (err instanceof ApiClientError) {
          setError(err.message || "Failed to load feeds");
        } else {
          setError("An unexpected error occurred");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeeds();
  }, [page, search, sortOrder, perPage]);

  const pageCount = Math.max(1, Math.ceil(total / perPage));

  const handleToggle = async (feed: Feed) => {
    const newEnabled = feed.status === "disabled";
    setTogglingIds((prev) => new Set(prev).add(feed.id));

    try {
      const updatedFeed = await feedsApi.toggle(feed.id, newEnabled);
      setFeeds((prev) =>
        prev.map((f) => (f.id === feed.id ? updatedFeed : f))
      );
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message || "Failed to toggle feed");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(feed.id);
        return next;
      });
    }
  };

  const handleDelete = async () => {
    if (!targetFeed) return;

    try {
      await feedsApi.delete(targetFeed.id);
      setFeeds((prev) => prev.filter((f) => f.id !== targetFeed.id));
      setTotal((prev) => prev - 1);
      setTargetFeed(null);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message || "Failed to delete feed");
      } else {
        setError("An unexpected error occurred");
      }
      setTargetFeed(null);
    }
  };

  const handleEdit = (feedId: string) => {
    router.push(`/dashboard/feeds/${feedId}`);
  };

  const handleRefresh = async (feed: Feed) => {
    setRefreshingIds((prev) => new Set(prev).add(feed.id));
    setError(null);

    try {
      const result = await feedsApi.refresh(feed.id);
      
      if (result.success) {
        setError(null);
        // Refresh the feed list to update lastUpdated timestamp
        const response = await feedsApi.list({
          page,
          limit: perPage,
          search: search || undefined,
          sortBy: sortOrder,
        });
        setFeeds(response.data);
        setTotal(response.pagination.total);
      } else {
        setError(
          result.error || `Failed to refresh feed: ${result.articlesCreated} articles created, ${result.articlesSkipped} skipped`
        );
      }
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message || "Failed to refresh feed");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setRefreshingIds((prev) => {
        const next = new Set(prev);
        next.delete(feed.id);
        return next;
      });
    }
  };

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
            placeholder="Search by feed name..."
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={sortOrder === "newest" ? "primary" : "secondary"}
            onClick={() => {
              setSortOrder("newest");
              setPage(1);
            }}
            className="text-xs sm:text-sm"
          >
            Newest First
          </Button>
          <Button
            variant={sortOrder === "oldest" ? "primary" : "secondary"}
            onClick={() => {
              setSortOrder("oldest");
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
                  Feed
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700">
                  Industries
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700">
                  Auto-update
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700">
                  Full-text
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700">
                  Last Updated
                </th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-zinc-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-zinc-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900"></div>
                      <span>Loading feeds...</span>
                    </div>
                  </td>
                </tr>
              ) : feeds.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-zinc-500">
                    {search ? "No feeds match your search." : "No feeds found. Create your first feed to get started."}
                  </td>
                </tr>
              ) : (
                feeds.map((feed) => (
                  <tr key={feed.id} className="transition-colors hover:bg-zinc-50">
                    <td className="whitespace-nowrap px-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-zinc-900">
                          {feed.name}
                        </span>
                        <span className="mt-0.5 truncate text-xs text-zinc-500 max-w-xs">
                          {feed.url}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {feed.industries.length > 0 ? (
                          feed.industries.map((industry) => (
                            <Badge
                              key={`${feed.id}-${industry.id}`}
                              label={industry.name}
                              variant="outline"
                            />
                          ))
                        ) : (
                          <span className="text-xs text-zinc-400">None</span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                        feed.autoUpdate
                          ? "bg-green-100 text-green-800"
                          : "bg-zinc-100 text-zinc-800"
                      )}>
                        {feed.autoUpdate ? "On" : "Off"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                        feed.fullText
                          ? "bg-green-100 text-green-800"
                          : "bg-zinc-100 text-zinc-800"
                      )}>
                        {feed.fullText ? "On" : "Off"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-zinc-600">
                      {formatDate(feed.lastUpdated)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          onClick={() => router.push(`/dashboard/feeds/${feed.id}/articles`)}
                          className="text-xs sm:text-sm"
                          title="View articles"
                        >
                          Articles
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => handleRefresh(feed)}
                          disabled={refreshingIds.has(feed.id)}
                          className="text-xs sm:text-sm"
                          title="Refresh feed"
                        >
                          {refreshingIds.has(feed.id) ? (
                            <span className="flex items-center gap-1">
                              <span className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900"></span>
                              Refreshing...
                            </span>
                          ) : (
                            "Refresh"
                          )}
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => handleEdit(feed.id)}
                          className="text-xs sm:text-sm"
                        >
                          Edit
                        </Button>
                        <Button
                          variant={feed.status === "enabled" ? "secondary" : "ghost"}
                          onClick={() => handleToggle(feed)}
                          disabled={togglingIds.has(feed.id)}
                          className="text-xs sm:text-sm"
                        >
                          {togglingIds.has(feed.id)
                            ? "..."
                            : feed.status === "enabled"
                              ? "Disable"
                              : "Enable"}
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => setTargetFeed(feed)}
                          className="text-xs sm:text-sm"
                        >
                          Delete
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
      {!isLoading && feeds.length > 0 && (
        <div className="flex justify-end">
          <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        open={Boolean(targetFeed)}
        title="Delete feed?"
        description={
          targetFeed
            ? `This will permanently remove "${targetFeed.name}". This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onClose={() => setTargetFeed(null)}
      />
    </div>
  );
}

