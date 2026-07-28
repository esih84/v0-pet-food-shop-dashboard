"use client";

import { useState } from "react";
import { Header } from "@/components/dashboard/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { Search, Loader2, Eye, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  useCrmCustomers,
  useSegments,
  useSegmentCounts,
} from "@/features/crm/queries";
import { useRecomputeRfm } from "@/features/crm/mutations";
import {
  UNCLASSIFIED_SEGMENT,
  findSegment,
  segmentClasses,
} from "@/features/crm/segment-display";
import type { RfmSegment } from "@/features/crm/crm-api";
import { DataPagination } from "@/components/dashboard/data-pagination";
import {
  RfmScoreFilter,
  type RfmScoreRange,
} from "@/components/dashboard/rfm-score-filter";
import { PAGE_SIZE } from "@/lib/pagination";

const toman = (v?: number | null) =>
  v ? `${Math.round(Number(v)).toLocaleString("fa-IR")} تومان` : "—";

/** Tint a score so a row of digits can be scanned at a glance: 5 is best, 1 is worst. */
const scoreClass = (v?: number | null) =>
  v == null
    ? "text-muted-foreground"
    : v >= 4
      ? "text-green-600"
      : v === 3
        ? "text-foreground"
        : "text-amber-600";

function RfmScoreCell({
  r,
  f,
  m,
}: {
  r?: number | null;
  f?: number | null;
  m?: number | null;
}) {
  if (r == null && f == null && m == null) {
    return <span className="text-muted-foreground">—</span>;
  }
  return (
    <span className="font-mono text-sm" dir="ltr">
      {[r, f, m].map((v, i) => (
        <span key={i}>
          {i > 0 && <span className="text-muted-foreground"> / </span>}
          <span className={scoreClass(v)}>
            {v == null ? "—" : v.toLocaleString("fa-IR")}
          </span>
        </span>
      ))}
    </span>
  );
}

/**
 * Label and colour come from the segment definitions, so a renamed or recoloured segment
 * follows here without a code change. An unknown key (a segment deleted since the last
 * recomputation) still renders — as the raw key, which is more useful than a blank cell.
 */
function SegmentBadge({
  segmentKey,
  segments,
}: {
  segmentKey?: string | null;
  segments?: RfmSegment[];
}) {
  if (!segmentKey) {
    return (
      <Badge
        variant="outline"
        className={segmentClasses(UNCLASSIFIED_SEGMENT.color).badge}
      >
        {UNCLASSIFIED_SEGMENT.label}
      </Badge>
    );
  }
  const segment = findSegment(segments, segmentKey);
  return (
    <Badge variant="outline" className={segmentClasses(segment?.color).badge}>
      {segment?.label ?? segmentKey}
    </Badge>
  );
}

function daysSince(date?: string | null): string {
  if (!date) return "—";
  const d = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  if (d <= 0) return "امروز";
  return `${d.toLocaleString("fa-IR")} روز پیش`;
}

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const [segment, setSegment] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [scores, setScores] = useState<RfmScoreRange>({});

  const filter = {
    page,
    limit: PAGE_SIZE,
    segment: segment === "all" ? undefined : segment,
    search: query || undefined,
    ...scores,
  };
  const { data: response, isLoading } = useCrmCustomers(filter);
  const { data: segments } = useSegments();
  const { data: counts } = useSegmentCounts();
  const recompute = useRecomputeRfm();

  const customers = response?.data ?? [];

  // Defined segments plus the unclassified bucket, which is not a row but still worth
  // filtering by — it is how an operator finds the customers their rules missed.
  const chips = [
    ...(segments ?? []).map((s) => ({
      key: s.key,
      label: s.label,
      color: s.color,
    })),
    ...((counts?.[UNCLASSIFIED_SEGMENT.key] ?? 0) > 0
      ? [UNCLASSIFIED_SEGMENT]
      : []),
  ];

  const handleRecompute = async () => {
    try {
      const res = await recompute.mutateAsync();
      toast.success(
        `بازمحاسبه انجام شد (${res.updated.toLocaleString("fa-IR")} مشتری).`,
      );
    } catch {
      /* Global toast */
    }
  };

  return (
    <div className="flex flex-col" dir="rtl">
      <Header
        title="مشتریان"
        description="فهرست مشتریان با تحلیل RFM و سگمنت‌بندی."
      />
      <div className="flex-1 p-6 space-y-6">
        {/* Segments bar */}
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {chips.map((s) => (
              <button
                key={s.key}
                onClick={() => {
                  setSegment((prev) => (prev === s.key ? "all" : s.key));
                  setPage(1);
                }}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  segment === s.key
                    ? "ring-2 ring-primary/40 " + segmentClasses(s.color).badge
                    : segmentClasses(s.color).badge
                }`}
              >
                {s.label}: {(counts?.[s.key] ?? 0).toLocaleString("fa-IR")}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="جستجو در نام/موبایل..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                className="pr-9 bg-input"
              />
            </div>
            <Select
              value={segment}
              onValueChange={(v) => {
                setSegment(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[160px] bg-input">
                <SelectValue placeholder="سگمنت" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه‌ی سطوح</SelectItem>
                {chips.map((s) => (
                  <SelectItem key={s.key} value={s.key}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <RfmScoreFilter
              value={scores}
              onChange={(next) => {
                setScores(next);
                setPage(1);
              }}
            />
          </div>
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleRecompute}
            disabled={recompute.isPending}
          >
            {recompute.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            بازمحاسبه‌ی RFM
          </Button>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">همه‌ی مشتریان</CardTitle>
            <CardDescription>
              {(response?.total ?? 0).toLocaleString("fa-IR")} مشتری
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground text-right">نام</TableHead>
                    <TableHead className="text-muted-foreground text-right">موبایل</TableHead>
                    <TableHead className="text-muted-foreground text-right">سگمنت</TableHead>
                    <TableHead
                      className="text-muted-foreground text-right"
                      title="امتیاز تازگی / تعداد / مبلغ خرید — هر کدام ۱ تا ۵"
                    >
                      R / F / M
                    </TableHead>
                    <TableHead className="text-muted-foreground text-right">تعداد سفارش</TableHead>
                    <TableHead className="text-muted-foreground text-right">مبلغ کل</TableHead>
                    <TableHead className="text-muted-foreground text-right">آخرین خرید</TableHead>
                    <TableHead className="text-muted-foreground text-left">عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((c) => (
                    <TableRow key={c.id} className="border-border">
                      <TableCell className="font-medium text-foreground">
                        {`${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() || "—"}
                      </TableCell>
                      <TableCell className="text-foreground">{c.phone}</TableCell>
                      <TableCell>
                        <SegmentBadge
                          segmentKey={c.rfmSegment}
                          segments={segments}
                        />
                      </TableCell>
                      <TableCell>
                        <RfmScoreCell r={c.rfmR} f={c.rfmF} m={c.rfmM} />
                      </TableCell>
                      <TableCell className="text-foreground">
                        {(c.orderCount ?? 0).toLocaleString("fa-IR")}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {toman(c.totalSpent)}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {daysSince(c.lastPurchaseAt)}
                      </TableCell>
                      <TableCell className="text-left">
                        <Link href={`/customers/${c.id}`}>
                          <Button variant="ghost" size="icon" aria-label="مشاهده جزئیات">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <DataPagination
              page={page}
              totalPages={response?.totalPages ?? 1}
              total={response?.total}
              onPageChange={setPage}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
