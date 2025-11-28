import { DashboardShell } from "@/components/layout/DashboardShell";
import Link from "next/link";
import { FeedTable } from "@/components/feeds/FeedTable";
import { Button } from "@/components/ui/button";

// Plus icon for add button
const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

export default function FeedsPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <DashboardShell
        title="Feeds"
        description="Manage every RSS/news source powering StartupNews.fyi"
        actions={
          <Link href="/dashboard/feeds/add">
            <Button variant="primary" className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              <span>Add Feed</span>
            </Button>
          </Link>
        }
      >
        <FeedTable />
      </DashboardShell>
    </div>
  );
}

