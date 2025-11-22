import { DashboardShell } from "@/components/layout/DashboardShell";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { FeedTable } from "@/components/feeds/FeedTable";
import { mockFeeds } from "@/lib/mock-data";

export default function FeedsPage() {
  const enabledFeeds = mockFeeds.filter((feed) => feed.status === "enabled").length;
  const disabledFeeds = mockFeeds.length - enabledFeeds;

  return (
    <DashboardShell
      title="Feeds"
      description="Manage every RSS/news source powering StartupNews.fyi"
      actions={
        <Link
          href="/dashboard/feeds/add"
          className={cn(
            "inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-900",
          )}
        >
          Add feed
        </Link>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Total feeds">
          <p className="text-3xl font-semibold">{mockFeeds.length}</p>
        </Card>
        <Card title="Enabled">
          <p className="text-3xl font-semibold text-emerald-600">
            {enabledFeeds}
          </p>
        </Card>
        <Card title="Disabled">
          <p className="text-3xl font-semibold text-orange-600">
            {disabledFeeds}
          </p>
        </Card>
      </div>
      <FeedTable feeds={mockFeeds} />
    </DashboardShell>
  );
}

