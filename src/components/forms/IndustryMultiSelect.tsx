'use client';

import { useEffect, useMemo, useState } from "react";
import type { Industry } from "@/lib/types/industry";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { industriesApi } from "@/lib/api/industries";
import { ApiClientError } from "@/lib/api/client";

interface IndustryMultiSelectProps {
  selected: Industry[];
  onChange: (value: Industry[]) => void;
}

export function IndustryMultiSelect({
  selected,
  onChange,
}: IndustryMultiSelectProps) {
  const [query, setQuery] = useState("");
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const data = await industriesApi.list();
        setIndustries(data);
      } catch (err) {
        if (err instanceof ApiClientError) {
          setError(err.message || "Failed to load industries");
        } else {
          setError("An unexpected error occurred");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchIndustries();
  }, []);

  const filtered = useMemo(() => {
    return industries.filter((industry) =>
      industry.name.toLowerCase().includes(query.toLowerCase()),
    );
  }, [industries, query]);

  const toggleIndustry = (industry: Industry) => {
    const isSelected = selected.some((ind) => ind.id === industry.id);
    if (isSelected) {
      onChange(selected.filter((item) => item.id !== industry.id));
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
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}
      {isLoading ? (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-center text-sm text-zinc-500">
          Loading industries...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3 sm:grid-cols-3">
            {filtered.map((industry) => {
              const active = selected.some((ind) => ind.id === industry.id);
              return (
                <button
                  key={industry.id}
                  type="button"
                  className={`rounded-md border px-2 py-1 text-sm transition ${
                    active
                      ? "border-black bg-black text-white"
                      : "border-transparent bg-white text-zinc-700 hover:border-zinc-200"
                  }`}
                  onClick={() => toggleIndustry(industry)}
                >
                  {industry.name}
                </button>
              );
            })}
          </div>
          {selected.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selected.map((industry) => (
                <Badge key={industry.id} label={industry.name} variant="outline" />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

