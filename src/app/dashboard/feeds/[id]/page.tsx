import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { FeedForm } from "@/components/forms/FeedForm";
import { Card } from "@/components/ui/card";
import { mockFeeds } from "@/lib/mock-data";

interface EditFeedPageProps {
  params: { id: string };
}

export default function EditFeedPage({ params }: EditFeedPageProps) {
  const feed = mockFeeds.find((item) => item.id === params.id);

  if (!feed) {
    notFound();
  }

  return (
    <DashboardShell
      title={`Edit feed: ${feed.name}`}
      description="Update feed metadata, industry tags, and toggles."
    >
      <Card>
        <FeedForm mode="edit" initialValues={feed} />
      </Card>
    </DashboardShell>
  );
}

