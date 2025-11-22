'use client';

import { Button } from "./button";

interface PaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, pageCount, onPageChange }: PaginationProps) {
  return (
    <div className="flex items-center gap-4">
      <Button
        variant="secondary"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
      >
        Previous
      </Button>
      <span className="text-sm text-zinc-600">
        Page {page} of {pageCount}
      </span>
      <Button
        variant="secondary"
        onClick={() => onPageChange(Math.min(pageCount, page + 1))}
        disabled={page === pageCount}
      >
        Next
      </Button>
    </div>
  );
}

