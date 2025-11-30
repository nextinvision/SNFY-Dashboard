'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { FeedForm } from "@/components/forms/FeedForm";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { feedsApi } from "@/lib/api/feeds";
import type { Feed } from "@/lib/types/feed";
import { ApiClientError } from "@/lib/api/client";

interface EditFeedPageProps {
  params: { id: string };
}

export default function EditFeedPage({ params }: EditFeedPageProps) {
  const router = useRouter();
  const [feed, setFeed] = useState<Feed | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const data = await feedsApi.getById(params.id);
        setFeed(data);
      } catch (err) {
        if (err instanceof ApiClientError && err.statusCode === 404) {
          notFound();
        } else {
          setError(err instanceof ApiClientError ? err.message : "Failed to load feed");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeed();
  }, [params.id]);

  if (isLoading) {
    return (
      <DashboardShell title="Edit feed" description="Loading...">
        <Card>
          <div className="p-6 text-center text-sm text-zinc-500">Loading feed...</div>
        </Card>
      </DashboardShell>
    );
  }

  if (error || !feed) {
    return (
      <DashboardShell title="Edit feed" description="Error loading feed">
        <Card>
          <div className="p-6 text-center text-sm text-red-600">
            {error || "Feed not found"}
          </div>
        </Card>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title={`Edit feed: ${feed.name}`}
      description="Update feed metadata, industry tags, and toggles."
      actions={
        <Link href={`/dashboard/feeds/${feed.id}/articles`}>
          <Button variant="secondary">View Articles</Button>
        </Link>
      }
    >
      <Card>
        <FeedForm mode="edit" initialValues={feed} feedId={feed.id} />
      </Card>
    </DashboardShell>
  );
}

