'use client';

import { useState } from 'react';
import { DashboardShell } from "@/components/layout/DashboardShell";
import { UserTable } from "@/components/users/UserTable";
import { UserForm } from "@/components/forms/UserForm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { isAdministrator } from "@/lib/utils/roles";

export default function UsersPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const isAdmin = isAdministrator();

  const handleUserCreated = () => {
    setShowCreateForm(false);
    // Trigger refresh of user table
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="mx-auto max-w-7xl">
      <DashboardShell
        title="Users"
        description={isAdmin ? "Manage user accounts and permissions." : "Read-only overview of user accounts."}
        actions={
          isAdmin && !showCreateForm ? (
            <Button onClick={() => setShowCreateForm(true)}>
              Create User
            </Button>
          ) : null
        }
      >
        {showCreateForm && isAdmin ? (
          <Card>
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-zinc-900">Create New User</h2>
                <p className="text-sm text-zinc-500">Add a new user account to the system</p>
              </div>
              <UserForm
                onSuccess={handleUserCreated}
                onCancel={() => setShowCreateForm(false)}
              />
            </div>
          </Card>
        ) : (
          <UserTable 
            refreshTrigger={refreshKey} 
            onRefresh={() => setRefreshKey((prev) => prev + 1)}
          />
        )}
      </DashboardShell>
    </div>
  );
}

