'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-zinc-200 bg-white">
      <div className="px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black text-white font-semibold">
            SN
          </div>
          <div>
            <p className="text-xs uppercase text-zinc-500">StartupNews.fyi</p>
            <p className="text-lg font-semibold text-zinc-900">Admin</p>
          </div>
        </div>
      </div>
      <nav className="mt-4 flex flex-col gap-1 px-3">
        {NAV_LINKS.map((link) => {
          const active = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-black text-white"
                  : "text-zinc-600 hover:bg-zinc-100",
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto px-6 py-6 text-xs text-zinc-400">
        IP restricted access
      </div>
    </aside>
  );
}

