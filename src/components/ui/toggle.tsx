'use client';

import { cn } from "@/lib/utils";

interface ToggleProps {
  label?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

export function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 rounded-full border border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-black/20",
          checked ? "bg-black" : "bg-zinc-200",
        )}
        aria-pressed={checked}
      >
        <span
          className={cn(
            "absolute left-0 top-0 h-6 w-6 transform rounded-full bg-white shadow transition",
            checked ? "translate-x-5" : "",
          )}
        />
      </button>
      {label && <span className="text-sm text-zinc-700">{label}</span>}
    </div>
  );
}

