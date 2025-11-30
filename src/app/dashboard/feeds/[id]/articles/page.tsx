'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ArticlesTable } from '@/components/articles/ArticlesTable';
import { Card } from '@/components/ui/card';
import { feedsApi } from '@/lib/api/feeds';
import type { Feed } from '@/lib/types/feed';
import { ApiClientError } from '@/lib/api/client';

export default function FeedArticlesPage() {
  const params = useParams();
  const feedId = params.id as string;
  const [feed, setFeed] = useState<Feed | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const data = await feedsApi.getById(feedId);
        setFeed(data);
      } catch (err) {
        if (err instanceof ApiClientError && err.statusCode === 404) {
          setError('Feed not found');
        } else {
          setError(
            err instanceof ApiClientError
              ? err.message
              : 'Failed to load feed',
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (feedId) {
      fetchFeed();
    }
  }, [feedId]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl">
        <DashboardShell
          title="Loading..."
          description="Loading feed information"
        >
          <Card>
            <div className="p-6 text-center text-sm text-zinc-500">
              Loading feed...
            </div>
          </Card>
        </DashboardShell>
      </div>
    );
  }

  if (error || !feed) {
    return (
      <div className="mx-auto max-w-7xl">
        <DashboardShell
          title="Error"
          description="Failed to load feed"
        >
          <Card>
            <div className="p-6 text-center text-sm text-red-600">
              {error || 'Feed not found'}
            </div>
          </Card>
        </DashboardShell>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <DashboardShell
        title={`Articles - ${feed.name}`}
        description={`Articles from ${feed.name} RSS feed`}
      >
        <ArticlesTable feedId={feed.id} feedName={feed.name} />
      </DashboardShell>
    </div>
  );
}

