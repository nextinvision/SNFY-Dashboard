import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/card";
import { UserTable } from "@/components/users/UserTable";
import { mockUsers } from "@/lib/mock-data";

export default function UsersPage() {
  return (
    <DashboardShell
      title="Users"
      description="Read-only overview of manually provisioned accounts."
    >
      <Card>
        <UserTable users={mockUsers} />
      </Card>
    </DashboardShell>
  );
}

