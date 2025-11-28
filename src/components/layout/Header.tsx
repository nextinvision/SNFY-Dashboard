'use client';

import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import type { User } from "@/lib/api/auth";

interface HeaderProps {
  onSidebarToggle: () => void;
  sidebarOpen: boolean;
}

// Menu icon for sidebar toggle
const MenuIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

// Close/X icon for sidebar toggle
const CloseIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// Logout icon
const LogoutIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

export function Header({ onSidebarToggle, sidebarOpen }: HeaderProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentUser = authApi.getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleLogout = () => {
    authApi.logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-4 shadow-sm lg:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onSidebarToggle}
          className="flex h-9 w-9 items-center justify-center rounded-md text-zinc-600 transition-colors hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          aria-expanded={sidebarOpen}
        >
          {sidebarOpen ? (
            <CloseIcon className="h-5 w-5" />
          ) : (
            <MenuIcon className="h-5 w-5" />
          )}
        </button>
        <div className="hidden sm:block">
          <p className="text-xs text-zinc-500">Logged in as</p>
          <p className="text-sm font-semibold text-zinc-900 lg:text-base">
            {user?.name || "User"}
          </p>
        </div>
        <div className="sm:hidden">
          <p className="text-sm font-semibold text-zinc-900">
            {user?.name || "User"}
          </p>
        </div>
      </div>
      <Button
        variant="secondary"
        onClick={handleLogout}
        className="flex items-center gap-2"
      >
        <LogoutIcon className="h-4 w-4" />
        <span className="hidden sm:inline">Logout</span>
      </Button>
    </header>
  );
}

