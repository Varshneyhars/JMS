"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  page: number;
  total: number;
  pageSize: number;
}

export function PaginationNav({ page, total, pageSize }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(total / pageSize);

  if (totalPages <= 1) return null;

  function makeHref(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", p.toString());
    return `${pathname}?${params.toString()}`;
  }

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-between px-2 py-3 border-t">
      <p className="text-xs text-muted-foreground">
        Showing {start}–{end} of {total}
      </p>
      <div className="flex items-center gap-1">
        <Link
          href={makeHref(page - 1)}
          aria-disabled={page <= 1}
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-md border text-sm transition-colors",
            page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-muted"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>

        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground text-sm">…</span>
          ) : (
            <Link
              key={p}
              href={makeHref(p)}
              className={cn(
                "inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-sm transition-colors",
                p === page
                  ? "bg-foreground text-background border-foreground"
                  : "hover:bg-muted"
              )}
            >
              {p}
            </Link>
          )
        )}

        <Link
          href={makeHref(page + 1)}
          aria-disabled={page >= totalPages}
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-md border text-sm transition-colors",
            page >= totalPages ? "pointer-events-none opacity-40" : "hover:bg-muted"
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
