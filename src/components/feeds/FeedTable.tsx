'use client';

import { useMemo, useState } from "react";
import type { Feed } from "@/lib/types/feed";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/ui/search-bar";
import { Pagination } from "@/components/ui/pagination";
import { Modal } from "@/components/ui/modal";

type SortOrder = "newest" | "oldest";

interface FeedTableProps {
  feeds: Feed[];
}

export function FeedTable({ feeds }: FeedTableProps) {
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [page, setPage] = useState(1);
  const [targetFeed, setTargetFeed] = useState<Feed | null>(null);

  const perPage = 5;

  const filtered = useMemo(() => {
    return feeds
      .filter((feed) =>
        feed.name.toLowerCase().includes(search.toLowerCase()),
      )
      .sort((a, b) => {
        const aDate = new Date(a.lastUpdated).getTime();
        const bDate = new Date(b.lastUpdated).getTime();
        return sortOrder === "newest" ? bDate - aDate : aDate - bDate;
      });
  }, [feeds, search, sortOrder]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleDelete = () => {
    if (!targetFeed) return;
    console.info("Delete feed request", targetFeed.id);
    setTargetFeed(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-4 md:flex-row md:items-end md:justify-between">
        <div className="w-full md:max-w-sm">
          <SearchBar
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            placeholder="Search by feed name"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={sortOrder === "newest" ? "primary" : "secondary"}
            onClick={() => setSortOrder("newest")}
          >
            Newest first
          </Button>
          <Button
            variant={sortOrder === "oldest" ? "primary" : "secondary"}
            onClick={() => setSortOrder("oldest")}
          >
            Oldest first
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <table className="min-w-full divide-y divide-zinc-100">
          <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3">Feed</th>
              <th className="px-4 py-3">Industries</th>
              <th className="px-4 py-3">Auto-update</th>
              <th className="px-4 py-3">Full-text</th>
              <th className="px-4 py-3">Last updated</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-sm text-zinc-700">
            {paginated.map((feed) => (
              <tr key={feed.id}>
                <td className="px-4 py-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-zinc-900">
                      {feed.name}
                    </span>
                    <span className="text-xs text-zinc-500">{feed.url}</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-1">
                    {feed.industries.map((industry) => (
                      <Badge key={`${feed.id}-${industry}`} label={industry} variant="outline" />
                    ))}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="text-sm">
                    {feed.autoUpdate ? "On" : "Off"}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className="text-sm">{feed.fullText ? "On" : "Off"}</span>
                </td>
                <td className="px-4 py-4 text-sm">{formatDate(feed.lastUpdated)}</td>
                <td className="px-4 py-4">
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary">Edit</Button>
                    <Button
                      variant={feed.status === "enabled" ? "secondary" : "ghost"}
                    >
                      {feed.status === "enabled" ? "Disable" : "Enable"}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => setTargetFeed(feed)}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-zinc-500">
            No feeds match this search.
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
      </div>

      <Modal
        open={Boolean(targetFeed)}
        title="Delete feed?"
        description={
          targetFeed
            ? `This will permanently remove "${targetFeed.name}".`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onClose={() => setTargetFeed(null)}
      />
    </div>
  );
}

