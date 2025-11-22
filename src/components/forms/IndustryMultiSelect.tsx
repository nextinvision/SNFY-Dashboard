'use client';

import { useMemo, useState } from "react";
import { INDUSTRIES } from "@/lib/constants";
import type { Industry } from "@/lib/types/industry";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface IndustryMultiSelectProps {
  selected: Industry[];
  onChange: (value: Industry[]) => void;
}

export function IndustryMultiSelect({
  selected,
  onChange,
}: IndustryMultiSelectProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return INDUSTRIES.filter((industry) =>
      industry.toLowerCase().includes(query.toLowerCase()),
    ) as Industry[];
  }, [query]);

  const toggleIndustry = (industry: Industry) => {
    if (selected.includes(industry)) {
      onChange(selected.filter((item) => item !== industry));
    } else {
      onChange([...selected, industry]);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-zinc-700">
        Industries<span className="text-red-500">*</span>
      </label>
      <Input
        placeholder="Search industries..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <div className="grid grid-cols-2 gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3 sm:grid-cols-3">
        {filtered.map((industry) => {
          const active = selected.includes(industry);
          return (
            <button
              key={industry}
              type="button"
              className={`rounded-md border px-2 py-1 text-sm transition ${
                active
                  ? "border-black bg-black text-white"
                  : "border-transparent bg-white text-zinc-700 hover:border-zinc-200"
              }`}
              onClick={() => toggleIndustry(industry)}
            >
              {industry}
            </button>
          );
        })}
      </div>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((industry) => (
            <Badge key={industry} label={industry} variant="outline" />
          ))}
        </div>
      )}
    </div>
  );
}

