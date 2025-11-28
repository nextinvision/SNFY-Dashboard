import { DashboardShell } from "@/components/layout/DashboardShell";
import { UserTable } from "@/components/users/UserTable";

export default function UsersPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <DashboardShell
        title="Users"
        description="Read-only overview of manually provisioned accounts."
      >
        <UserTable />
      </DashboardShell>
    </div>
  );
}

