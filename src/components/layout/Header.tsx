'use client';

import { useRouter } from "next/navigation";
import { MOCK_USER } from "@/lib/constants";
import { Button } from "@/components/ui/button";

export function Header() {
  const router = useRouter();

  const handleLogout = () => {
    // Replace with actual auth logout.
    router.push("/login");
  };

  return (
    <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4">
      <div>
        <p className="text-sm text-zinc-500">Logged in as</p>
        <p className="text-base font-semibold text-zinc-900">{MOCK_USER.name}</p>
      </div>
      <Button variant="secondary" onClick={handleLogout}>
        Logout
      </Button>
    </header>
  );
}

