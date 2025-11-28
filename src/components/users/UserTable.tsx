'use client';

import { useEffect, useState } from "react";
import type { User } from "@/lib/types/user";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { usersApi } from "@/lib/api/users";
import { ApiClientError } from "@/lib/api/client";

export function UserTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
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
  }, []);

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
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-zinc-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900"></div>
                      <span>Loading users...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-zinc-500">
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

