'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { CustomerTable } from '@/components/customers/CustomerTable';
import { isAdministrator } from '@/lib/utils/roles';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CustomersPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const isAdmin = isAdministrator();
  const router = useRouter();

  useEffect(() => {
    if (!isAdmin) {
      router.push('/dashboard/feeds');
    }
  }, [isAdmin, router]);

  if (!isAdmin) {
    return null;
  }

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="mx-auto max-w-7xl">
      <DashboardShell
        title="Customers"
        description="View and manage customer accounts registered from mobile applications."
      >
        <CustomerTable refreshTrigger={refreshKey} onRefresh={handleRefresh} />
      </DashboardShell>
    </div>
  );
}

