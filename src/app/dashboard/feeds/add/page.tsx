import { DashboardShell } from "@/components/layout/DashboardShell";
import { FeedForm } from "@/components/forms/FeedForm";
import { Card } from "@/components/ui/card";

export default function AddFeedPage() {
  return (
    <DashboardShell
      title="Add feed"
      description="Register a new RSS/news source with required metadata."
    >
      <Card>
        <FeedForm mode="create" />
      </Card>
    </DashboardShell>
  );
}

