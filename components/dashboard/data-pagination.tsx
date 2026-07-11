"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DataPaginationProps {
  /** صفحه‌ی فعلی (۱-based) */
  page: number;
  /** تعداد کل صفحات (از پاسخ بک‌اند) */
  totalPages: number;
  /** با تغییر صفحه صدا زده می‌شود */
  onPageChange: (page: number) => void;
  /** تعداد کل ردیف‌ها — برای نمایش برچسب (اختیاری) */
  total?: number;
  className?: string;
}

/**
 * فهرست شماره‌ی صفحه‌ها با «…» برای فاصله‌ها.
 * همیشه صفحه‌ی اول/آخر و صفحه‌ی فعلی ± ۱ نمایش داده می‌شود.
 */
function buildPageItems(current: number, total: number): (number | "…")[] {
  const delta = 1;
  const pages = new Set<number>([1, total]);
  for (let i = current - delta; i <= current + delta; i++) {
    if (i >= 1 && i <= total) pages.add(i);
  }
  const sorted = [...pages].sort((a, b) => a - b);

  const items: (number | "…")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) items.push("…");
    items.push(p);
    prev = p;
  }
  return items;
}

const fa = (n: number) => n.toLocaleString("fa-IR");

/**
 * کامپوننت صفحه‌بندی مشترک داشبورد (RTL، فارسی).
 * داده‌ها در بک‌اند صفحه‌بندی می‌شوند؛ این کامپوننت فقط شماره‌ی صفحه را عوض می‌کند.
 * اگر فقط یک صفحه وجود داشته باشد، چیزی رندر نمی‌شود.
 */
export function DataPagination({
  page,
  totalPages,
  onPageChange,
  total,
  className,
}: DataPaginationProps) {
  if (totalPages <= 1) return null;

  const go = (p: number) => {
    const next = Math.min(Math.max(p, 1), totalPages);
    if (next !== page) onPageChange(next);
  };

  const items = buildPageItems(page, totalPages);

  return (
    <div
      className={cn(
        "flex flex-col-reverse items-center gap-3 pt-4 sm:flex-row sm:justify-between",
        className,
      )}
    >
      {typeof total === "number" && (
        <p className="text-xs text-muted-foreground">
          {fa(total)} مورد — صفحه‌ی {fa(page)} از {fa(totalPages)}
        </p>
      )}

      <nav
        role="navigation"
        aria-label="صفحه‌بندی"
        className="flex items-center gap-1"
      >
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={() => go(page - 1)}
          disabled={page <= 1}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="hidden sm:inline">قبلی</span>
        </Button>

        {items.map((item, i) =>
          item === "…" ? (
            <span
              key={`ellipsis-${i}`}
              className="flex h-9 w-9 items-center justify-center text-sm text-muted-foreground"
            >
              …
            </span>
          ) : (
            <Button
              key={item}
              variant={item === page ? "default" : "ghost"}
              size="icon"
              className="h-9 w-9"
              aria-current={item === page ? "page" : undefined}
              onClick={() => go(item)}
            >
              {fa(item)}
            </Button>
          ),
        )}

        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={() => go(page + 1)}
          disabled={page >= totalPages}
        >
          <span className="hidden sm:inline">بعدی</span>
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </nav>
    </div>
  );
}
