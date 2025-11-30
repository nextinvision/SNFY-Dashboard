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

// Upload icon for bulk import
const UploadIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

export default function FeedsPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <DashboardShell
        title="Feeds"
        description="Manage every RSS/news source powering StartupNews.fyi"
        actions={
          <div className="flex gap-2">
            <Link href="/dashboard/feeds/bulk-import">
              <Button variant="secondary" className="flex items-center gap-2">
                <UploadIcon className="h-4 w-4" />
                <span>Bulk Import</span>
              </Button>
            </Link>
            <Link href="/dashboard/feeds/add">
              <Button variant="primary" className="flex items-center gap-2">
                <PlusIcon className="h-4 w-4" />
                <span>Add Feed</span>
              </Button>
            </Link>
          </div>
        }
      >
        <FeedTable />
      </DashboardShell>
    </div>
  );
}

