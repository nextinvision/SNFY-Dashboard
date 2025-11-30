import { DashboardShell } from '@/components/layout/DashboardShell';
import { Card } from '@/components/ui/card';
import { BulkFeedImport } from '@/components/forms/BulkFeedImport';

export default function BulkImportPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <DashboardShell
        title="Bulk Import Feeds"
        description="Import multiple RSS feeds at once. Enter one URL per line or use format: Name|URL|LogoURL"
      >
        <Card>
          <div className="p-6">
            <BulkFeedImport />
          </div>
        </Card>
      </DashboardShell>
    </div>
  );
}

