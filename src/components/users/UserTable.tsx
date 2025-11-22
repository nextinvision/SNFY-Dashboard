import type { User } from "@/lib/types/user";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface UserTableProps {
  users: User[];
}

export function UserTable({ users }: UserTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <table className="min-w-full divide-y divide-zinc-100 text-sm text-zinc-700">
        <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Last login</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-4 py-4 font-semibold text-zinc-900">
                {user.name}
              </td>
              <td className="px-4 py-4">{user.email}</td>
              <td className="px-4 py-4 capitalize">{user.role}</td>
              <td className="px-4 py-4">
                <Badge
                  label={user.status === "active" ? "Active" : "Inactive"}
                  variant={user.status === "active" ? "default" : "outline"}
                />
              </td>
              <td className="px-4 py-4">{formatDate(user.lastLogin)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

