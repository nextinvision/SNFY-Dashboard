'use client';

import { useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

// Simple SVG Icons
const FeedIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const UsersIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  '/dashboard/feeds': FeedIcon,
  '/dashboard/users': UsersIcon,
};

const MOBILE_BREAKPOINT = 1024;

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();

  // Memoize active link calculation
  const isLinkActive = useCallback((link: typeof NAV_LINKS[0]) => {
    return link.exact ? pathname === link.href : pathname.startsWith(link.href);
  }, [pathname]);

  // Handle navigation click - close sidebar on mobile
  const handleNavClick = useCallback(() => {
    if (typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT) {
      onToggle();
    }
  }, [onToggle]);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 top-16 z-20 bg-black/50 lg:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 z-30 flex h-[calc(100vh-4rem)] flex-col border-r border-zinc-200 bg-white transition-all duration-300 ease-in-out",
          "top-16", // Position below header (header height is 4rem/64px)
          "lg:relative lg:top-0 lg:z-auto lg:h-full",
          isOpen ? "flex w-64" : "hidden lg:flex lg:w-16",
        )}
      >
        {/* Navigation */}
        <nav className={cn(
          "flex flex-1 flex-col gap-1 overflow-y-auto",
          isOpen ? "px-3 pt-4 pb-4" : "px-2 pt-4 pb-4"
        )}>
          {NAV_LINKS.map((link) => {
            const active = isLinkActive(link);
            const Icon = iconMap[link.href] || FeedIcon;
            
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={handleNavClick}
                title={!isOpen ? link.label : undefined}
                className={cn(
                  "flex items-center rounded-lg text-sm font-medium transition-all",
                  isOpen 
                    ? "gap-3 px-3 py-2.5" 
                    : "justify-center p-2.5",
                  active
                    ? "bg-black text-white shadow-sm"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
                )}
              >
                <Icon className={cn(
                  "h-5 w-5 shrink-0",
                  active ? "text-white" : "text-zinc-500"
                )} />
                {isOpen ? (
                  <span>{link.label}</span>
                ) : (
                  <span className="sr-only">{link.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        {isOpen && (
          <div className="border-t border-zinc-200 px-6 py-4 space-y-2">
            <p className="text-xs text-zinc-400">IP restricted access</p>
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/docs`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors flex items-center gap-1"
              title="Open API Documentation (Swagger)"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              API Docs
            </a>
          </div>
        )}
      </aside>
    </>
  );
}

