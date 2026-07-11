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
import { useCrmCustomers, useSegments } from "@/features/crm/queries";
import { useRecomputeRfm } from "@/features/crm/mutations";
import { SEGMENT_LABELS, SEGMENT_ORDER } from "@/features/crm/crm-api";
import { DataPagination } from "@/components/dashboard/data-pagination";
import { PAGE_SIZE } from "@/lib/pagination";

const toman = (v?: number | null) =>
  v ? `${Math.round(Number(v)).toLocaleString("fa-IR")} تومان` : "—";

const segmentBadgeClass: Record<string, string> = {
  champion: "bg-primary/15 text-primary border-primary/30",
  loyal: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  active: "bg-green-500/15 text-green-600 border-green-500/30",
  new: "bg-cyan-500/15 text-cyan-600 border-cyan-500/30",
  at_risk: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  lost: "bg-red-500/15 text-red-600 border-red-500/30",
  prospect: "",
};

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

  const filter = {
    page,
    limit: PAGE_SIZE,
    segment: segment === "all" ? undefined : segment,
    search: query || undefined,
  };
  const { data: response, isLoading } = useCrmCustomers(filter);
  const { data: segments } = useSegments();
  const recompute = useRecomputeRfm();

  const customers = response?.data ?? [];

  const handleRecompute = async () => {
    try {
      const res = await recompute.mutateAsync();
      toast.success(
        `بازمحاسبه انجام شد (${res.updated.toLocaleString("fa-IR")} مشتری).`,
      );
    } catch {
      /* toast سراسری */
    }
  };

  return (
    <div className="flex flex-col" dir="rtl">
      <Header
        title="مشتریان"
        description="فهرست مشتریان با تحلیل RFM و سگمنت‌بندی."
      />
      <div className="flex-1 p-6 space-y-6">
        {/* نوار سگمنت‌ها */}
        {segments && (
          <div className="flex flex-wrap gap-2">
            {SEGMENT_ORDER.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSegment((prev) => (prev === s ? "all" : s));
                  setPage(1);
                }}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  segment === s
                    ? "ring-2 ring-primary/40 " + (segmentBadgeClass[s] || "")
                    : segmentBadgeClass[s] || "bg-muted"
                }`}
              >
                {SEGMENT_LABELS[s]}: {(segments[s] ?? 0).toLocaleString("fa-IR")}
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
                <SelectItem value="all">همه‌ی سگمنت‌ها</SelectItem>
                {SEGMENT_ORDER.map((s) => (
                  <SelectItem key={s} value={s}>
                    {SEGMENT_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                        {c.rfmSegment ? (
                          <Badge
                            variant="outline"
                            className={segmentBadgeClass[c.rfmSegment] || ""}
                          >
                            {SEGMENT_LABELS[c.rfmSegment] ?? c.rfmSegment}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
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
