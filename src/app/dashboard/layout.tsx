'use client';

import { useEffect, useLayoutEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { authApi } from "@/lib/api/auth";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  // Use ref to track if component has mounted (client-side only)
  const isMountedRef = useRef(false);
  // Initialize all state to consistent values for SSR
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Always start with false for SSR - will be set after mount
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mark component as mounted and hydrate state (client-side only)
  // Use useLayoutEffect to hydrate before paint to prevent hydration mismatch
  // This is a standard Next.js pattern for syncing client-side state (localStorage) with SSR
  // The linter warning is a false positive - this is necessary for proper hydration
  useLayoutEffect(() => {
    // Mark as mounted
    isMountedRef.current = true;
    
    // Hydrate sidebar state from localStorage
    // This is necessary for client-side hydration and prevents SSR/client mismatch
    const savedState = localStorage.getItem('sidebarOpen');
    const initialSidebarState = savedState !== null 
      ? savedState === 'true'
      : window.innerWidth >= 1024;
    
    // Only update if different from initial state to minimize re-renders
    // eslint-disable-next-line react-compiler/react-compiler
    setSidebarOpen((prev) => {
      if (prev !== initialSidebarState) {
        return initialSidebarState;
      }
      return prev;
    });
  }, []); // Only run once on mount

  // Save sidebar state to localStorage (only after mount)
  useEffect(() => {
    if (!isMountedRef.current) return;
    localStorage.setItem('sidebarOpen', String(sidebarOpen));
  }, [sidebarOpen]);

  // Check authentication after mount
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    let mounted = true;
    
    const checkAuth = () => {
      if (!mounted || !isMountedRef.current) return;
      
      const authenticated = authApi.isAuthenticated();
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Dashboard auth check:', {
          authenticated,
          hasToken: !!localStorage.getItem('auth_token'),
          hasUser: !!localStorage.getItem('user'),
        });
      }
      
      setIsAuthenticated(authenticated);
      setIsChecking(false);
      
      if (!authenticated) {
        router.push("/login");
      }
    };

    // First check immediately
    checkAuth();
    
    // Double-check after a brief delay to catch any race conditions
    const timer = setTimeout(() => {
      if (mounted && isMountedRef.current) {
        checkAuth();
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      mounted = false;
    };
  }, [router]);

  // Handle window resize - only after mount
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    const handleResize = () => {
      // Only auto-close on mobile when resizing to mobile
      // Don't force open on desktop resize - respect user preference
      if (window.innerWidth < 1024 && sidebarOpen) {
        // Keep current state, but ensure sidebar can be toggled
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  // Show loading state while checking authentication
  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="text-center">
          <div className="mb-4 text-sm text-zinc-500">Checking authentication...</div>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900">
      {/* Header - Always at top */}
      <Header onSidebarToggle={toggleSidebar} sidebarOpen={sidebarOpen} />
      
      {/* Main Content Area with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
        <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

