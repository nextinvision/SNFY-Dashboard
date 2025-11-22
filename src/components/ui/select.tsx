'use client';

import { Fragment } from "react";
import { cn } from "@/lib/utils";

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
}

export function Select({ label, options, value, onChange }: SelectProps) {
  return (
    <label className="flex w-full flex-col gap-1 text-sm text-zinc-700">
      {label}
      <select
        className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

