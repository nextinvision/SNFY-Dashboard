'use client';

import { useEffect, useState } from 'react';
import type { Customer } from '@/lib/types/customer';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { customersApi } from '@/lib/api/customers';
import { ApiClientError } from '@/lib/api/client';

interface CustomerTableProps {
  refreshTrigger?: number;
  onRefresh?: () => void;
}

export function CustomerTable({ refreshTrigger, onRefresh }: CustomerTableProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailsModal, setDetailsModal] = useState<{ open: boolean; customer: Customer | null }>({
    open: false,
    customer: null,
  });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [emailVerifiedFilter, setEmailVerifiedFilter] = useState<boolean | undefined>(undefined);
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await customersApi.list({
          page,
          limit,
          search: search || undefined,
          emailVerified: emailVerifiedFilter,
          isActive: isActiveFilter,
        });
        setCustomers(response.data);
        setTotal(response.pagination.total);
        setTotalPages(response.pagination.totalPages);
      } catch (err) {
        if (err instanceof ApiClientError) {
          setError(err.message || 'Failed to load customers');
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, [refreshTrigger, page, limit, search, emailVerifiedFilter, isActiveFilter]);

  const handleDetailsClick = (customer: Customer) => {
    setDetailsModal({ open: true, customer });
  };

  const handleDetailsClose = () => {
    setDetailsModal({ open: false, customer: null });
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1); // Reset to first page on search
  };

  const handleFilterChange = (filterType: 'emailVerified' | 'isActive', value: boolean | undefined) => {
    if (filterType === 'emailVerified') {
      setEmailVerifiedFilter(value);
    } else {
      setIsActiveFilter(value);
    }
    setPage(1); // Reset to first page on filter change
  };

  if (isLoading && customers.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 text-center text-sm text-zinc-500">
        Loading customers...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name, email, or username..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="max-w-md w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={emailVerifiedFilter === undefined ? 'all' : emailVerifiedFilter.toString()}
            onChange={(e) => {
              const value = e.target.value === 'all' ? undefined : e.target.value === 'true';
              handleFilterChange('emailVerified', value);
            }}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          >
            <option value="all">All Verification Status</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
          </select>
          <select
            value={isActiveFilter === undefined ? 'all' : isActiveFilter.toString()}
            onChange={(e) => {
              const value = e.target.value === 'all' ? undefined : e.target.value === 'true';
              handleFilterChange('isActive', value);
            }}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          >
            <option value="all">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

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
                  Username
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700">
                  Phone
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700">
                  Verified
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700">
                  Status
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700">
                  Registered
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700">
                  Last Login
                </th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-zinc-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm text-zinc-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900"></div>
                      <span>Loading customers...</span>
                    </div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm text-zinc-500">
                    No customers found.
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="transition-colors hover:bg-zinc-50">
                    <td className="whitespace-nowrap px-4 py-4">
                      <div className="text-sm font-semibold text-zinc-900">
                        {customer.name}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <div className="text-sm text-zinc-600">{customer.email}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <div className="text-sm text-zinc-600">{customer.username}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <div className="text-sm text-zinc-600">
                        {customer.phone || <span className="text-zinc-400">-</span>}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <Badge
                        label={customer.emailVerified ? 'Verified' : 'Unverified'}
                        variant={customer.emailVerified ? 'default' : 'outline'}
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <Badge
                        label={customer.isActive ? 'Active' : 'Inactive'}
                        variant={customer.isActive ? 'default' : 'outline'}
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-zinc-600">
                      {formatDate(customer.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-zinc-600">
                      {customer.lastLoginAt ? formatDate(customer.lastLoginAt) : (
                        <span className="text-zinc-400">Never</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-right">
                      <Button
                        variant="secondary"
                        onClick={() => handleDetailsClick(customer)}
                        className="text-xs sm:text-sm"
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-zinc-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <Button
              variant="secondary"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || isLoading}
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-zinc-700">
                Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{' '}
                <span className="font-medium">{Math.min(page * limit, total)}</span> of{' '}
                <span className="font-medium">{total}</span> results
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? 'primary' : 'secondary'}
                      onClick={() => setPage(pageNum)}
                      disabled={isLoading}
                      className="min-w-[2.5rem]"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="secondary"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || isLoading}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      <Modal
        open={detailsModal.open}
        title="Customer Details"
        description={detailsModal.customer ? undefined : ''}
        onClose={handleDetailsClose}
        confirmLabel="Close"
        onConfirm={handleDetailsClose}
        showCancel={false}
      >
        {detailsModal.customer && (
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Name
              </label>
              <p className="mt-1 text-sm text-zinc-900">{detailsModal.customer.name}</p>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Email
              </label>
              <p className="mt-1 text-sm text-zinc-900">{detailsModal.customer.email}</p>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Username
              </label>
              <p className="mt-1 text-sm text-zinc-900">{detailsModal.customer.username}</p>
            </div>
            {detailsModal.customer.phone && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Phone
                </label>
                <p className="mt-1 text-sm text-zinc-900">{detailsModal.customer.phone}</p>
              </div>
            )}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Email Verified
              </label>
              <p className="mt-1">
                <Badge
                  label={detailsModal.customer.emailVerified ? 'Verified' : 'Unverified'}
                  variant={detailsModal.customer.emailVerified ? 'default' : 'outline'}
                />
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Status
              </label>
              <p className="mt-1">
                <Badge
                  label={detailsModal.customer.isActive ? 'Active' : 'Inactive'}
                  variant={detailsModal.customer.isActive ? 'default' : 'outline'}
                />
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Registered
              </label>
              <p className="mt-1 text-sm text-zinc-900">
                {formatDate(detailsModal.customer.createdAt)}
              </p>
            </div>
            {detailsModal.customer.lastLoginAt && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Last Login
                </label>
                <p className="mt-1 text-sm text-zinc-900">
                  {formatDate(detailsModal.customer.lastLoginAt)}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

