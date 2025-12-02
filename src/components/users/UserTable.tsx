'use client';

import { useEffect, useState } from "react";
import type { User } from "@/lib/types/user";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { usersApi } from "@/lib/api/users";
import { authApi } from "@/lib/api/auth";
import { ApiClientError } from "@/lib/api/client";
import { isAdministrator } from "@/lib/utils/roles";

interface UserTableProps {
  refreshTrigger?: number;
  onRefresh?: () => void;
}

export function UserTable({ refreshTrigger, onRefresh }: UserTableProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; user: User | null }>({
    open: false,
    user: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const isAdmin = isAdministrator();
  const currentUser = authApi.getCurrentUser();

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await usersApi.list({ page: 1, limit: 100 });
        setUsers(response.data);
      } catch (err) {
        if (err instanceof ApiClientError) {
          setError(err.message || "Failed to load users");
        } else {
          setError("An unexpected error occurred");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [refreshTrigger]);

  const handleDeleteClick = (user: User) => {
    setDeleteModal({ open: true, user });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.user) return;

    setIsDeleting(true);
    try {
      await usersApi.delete(deleteModal.user.id);
      setDeleteModal({ open: false, user: null });
      
      // Refresh the user list
      const response = await usersApi.list({ page: 1, limit: 100 });
      setUsers(response.data);
      
      // Trigger parent refresh if callback provided
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message || "Failed to delete user");
      } else {
        setError("An unexpected error occurred while deleting user");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ open: false, user: null });
  };

  const canDeleteUser = (user: User): boolean => {
    // Only admins can delete users
    if (!isAdmin) return false;
    // Prevent self-deletion
    if (currentUser && currentUser.id === user.id) return false;
    return true;
  };

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 text-center text-sm text-zinc-500">
        Loading users...
      </div>
    );
  }

  if (error) {
    return (
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 text-center text-sm text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <div className="font-medium">Error</div>
          <div className="mt-1">{error}</div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700">
                  Name
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700">
                  Email
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700">
                  Role
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700">
                  Status
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700">
                  Last Login
                </th>
                {isAdmin && (
                  <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-zinc-700">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="px-4 py-12 text-center text-sm text-zinc-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900"></div>
                      <span>Loading users...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="px-4 py-12 text-center text-sm text-zinc-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="transition-colors hover:bg-zinc-50">
                    <td className="whitespace-nowrap px-4 py-4">
                      <div className="text-sm font-semibold text-zinc-900">
                        {user.name}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <div className="text-sm text-zinc-600">{user.email}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium capitalize text-zinc-800">
                        {user.role}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <Badge
                        label={user.isActive ? "Active" : "Inactive"}
                        variant={user.isActive ? "default" : "outline"}
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-zinc-600">
                      {user.lastLoginAt ? formatDate(user.lastLoginAt) : (
                        <span className="text-zinc-400">Never</span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="whitespace-nowrap px-4 py-4 text-right">
                        {canDeleteUser(user) ? (
                          <Button
                            variant="secondary"
                            onClick={() => handleDeleteClick(user)}
                            className="text-xs sm:text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Delete
                          </Button>
                        ) : (
                          <span className="text-xs text-zinc-400">-</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={deleteModal.open}
        title="Delete User"
        description={
          deleteModal.user
            ? `Are you sure you want to delete "${deleteModal.user.name}" (${deleteModal.user.email})? This action cannot be undone.`
            : ""
        }
        confirmLabel={isDeleting ? "Deleting..." : "Delete"}
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        onClose={handleDeleteCancel}
        isLoading={isDeleting}
      />
    </div>
  );
}

