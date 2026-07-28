"use client";

import Link from "next/link";
import { Header } from "@/components/dashboard/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  UserCheck,
  UserPlus,
  HelpCircle,
  Loader2,
  RefreshCw,
  ArrowLeft,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import {
  useSegments,
  useSegmentCounts,
  useCrmCustomers,
} from "@/features/crm/queries";
import { useRecomputeRfm } from "@/features/crm/mutations";
import {
  UNCLASSIFIED_SEGMENT,
  describeRule,
  segmentClasses,
} from "@/features/crm/segment-display";

const fa = (v: number) => v.toLocaleString("fa-IR");

const toman = (v?: number | null) =>
  v ? `${Math.round(Number(v)).toLocaleString("fa-IR")} تومان` : "—";

function daysSince(date?: string | null): string {
  if (!date) return "—";
  const d = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  if (d <= 0) return "امروز";
  return `${d.toLocaleString("fa-IR")} روز پیش`;
}

export default function CrmPage() {
  const { data: segments, isLoading } = useSegments();
  const { data: counts } = useSegmentCounts();
  const recompute = useRecomputeRfm();

  const defined = segments ?? [];
  const countOf = (key: string) => counts?.[key] ?? 0;

  // The highest-priority non-system segment is, by the operator's own ordering, the most
  // selective one — so it stands in for "top customers" without hardcoding a segment name.
  const topSegment = defined.find((s) => !s.systemRole && s.isActive);
  const { data: topCustomers } = useCrmCustomers({
    segment: topSegment?.key,
    page: 1,
    limit: 5,
  });

  const unclassified = countOf(UNCLASSIFIED_SEGMENT.key);
  const noPurchase = defined
    .filter((s) => s.systemRole === "no_purchase")
    .reduce((sum, s) => sum + countOf(s.key), 0);
  const total =
    defined.reduce((sum, s) => sum + countOf(s.key), 0) + unclassified;

  // Cards cover every defined segment plus the unclassified bucket, so the distribution
  // always adds up to the whole customer base no matter how the rules are written.
  const buckets = [
    ...defined.map((s) => ({
      key: s.key,
      label: s.label,
      description: s.description || describeRule(s),
      color: s.color,
      count: countOf(s.key),
      inactive: !s.isActive,
    })),
    ...(unclassified > 0
      ? [
          {
            key: UNCLASSIFIED_SEGMENT.key,
            label: UNCLASSIFIED_SEGMENT.label,
            description: UNCLASSIFIED_SEGMENT.description,
            color: UNCLASSIFIED_SEGMENT.color,
            count: unclassified,
            inactive: false,
          },
        ]
      : []),
  ];

  const maxCount = Math.max(1, ...buckets.map((b) => b.count));
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);

  const handleRecompute = async () => {
    try {
      const res = await recompute.mutateAsync();
      toast.success(
        `بازمحاسبه انجام شد — سگمنت یا امتیاز ${fa(res.updated)} مشتری تغییر کرد.`,
      );
    } catch {
      /* Global toast */
    }
  };

  const kpis = [
    {
      label: "کل مشتریان",
      value: total,
      icon: Users,
      color: "text-foreground",
      bg: "bg-muted",
    },
    {
      label: "خریداران",
      value: Math.max(0, total - noPurchase),
      icon: UserCheck,
      color: "text-green-600",
      bg: "bg-green-500/10",
    },
    {
      label: "بدون خرید",
      value: noPurchase,
      icon: UserPlus,
      color: "text-muted-foreground",
      bg: "bg-muted",
    },
    {
      label: "طبقه‌بندی‌نشده",
      value: unclassified,
      icon: HelpCircle,
      color: unclassified > 0 ? "text-amber-600" : "text-muted-foreground",
      bg: unclassified > 0 ? "bg-amber-500/10" : "bg-muted",
    },
  ];

  return (
    <div className="flex flex-col" dir="rtl">
      <Header
        title="مدیریت ارتباط با مشتری (CRM)"
        description="سگمنت‌بندی مشتریان بر اساس تحلیل RFM. سگمنت‌ها هر شب ساعت ۳ بامداد به‌صورت خودکار به‌روز می‌شوند."
      />

      <div className="flex-1 space-y-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/customers">
            <Button variant="outline" className="gap-2">
              مشاهده‌ی فهرست کامل مشتریان
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/crm/segments">
              <Button variant="outline" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                مدیریت سطوح
              </Button>
            </Link>
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
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {kpis.map((k) => (
                <Card key={k.label} className="border-border bg-card">
                  <CardContent className="flex items-center gap-4 p-5">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${k.bg}`}
                    >
                      <k.icon className={`h-6 w-6 ${k.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {fa(k.value)}
                      </p>
                      <p className="text-sm text-muted-foreground">{k.label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {unclassified > 0 && (
              <Card className="border-amber-500/40 bg-amber-500/5">
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm leading-6">
                  <span>
                    <span className="font-medium text-amber-600">
                      {fa(unclassified)} مشتری
                    </span>{" "}
                    با هیچ‌کدام از سطوح فعلی جور در نیامده‌اند.
                  </span>
                  <Link href="/crm/segments">
                    <Button variant="outline" size="sm">
                      اصلاح سطوح
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Segment distribution */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">
                  توزیع سطوح مشتری
                </CardTitle>
                <CardDescription>
                  سهم هر سطح از کل {fa(total)} مشتری
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {buckets.map((b) => (
                  <div key={b.key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">
                        {b.label}
                        {b.inactive && (
                          <span className="mr-2 text-xs text-muted-foreground">
                            (غیرفعال)
                          </span>
                        )}
                      </span>
                      <span className="text-muted-foreground">
                        {fa(b.count)} نفر ({fa(pct(b.count))}٪)
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full transition-all ${segmentClasses(b.color).bar}`}
                        style={{ width: `${(b.count / maxCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Segment cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {buckets.map((b) => (
                <Card key={b.key} className="border-border bg-card">
                  <CardContent className="space-y-2 p-5">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className={segmentClasses(b.color).badge}
                      >
                        {b.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {fa(pct(b.count))}٪
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-foreground">
                      {fa(b.count)}
                    </p>
                    <p className="text-xs leading-5 text-muted-foreground">
                      {b.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Top customers of the highest-priority segment */}
            {topSegment && (
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground">
                    مشتریان «{topSegment.label}»
                  </CardTitle>
                  <CardDescription>
                    بالاترین سطح در ترتیب ارزیابی — {describeRule(topSegment)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {(topCustomers?.data ?? []).length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                      هنوز مشتری‌ای در این سطح نیست.
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border hover:bg-transparent">
                          <TableHead className="text-right text-muted-foreground">
                            نام
                          </TableHead>
                          <TableHead className="text-right text-muted-foreground">
                            موبایل
                          </TableHead>
                          <TableHead className="text-right text-muted-foreground">
                            تعداد سفارش
                          </TableHead>
                          <TableHead className="text-right text-muted-foreground">
                            مبلغ کل
                          </TableHead>
                          <TableHead className="text-right text-muted-foreground">
                            آخرین خرید
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(topCustomers?.data ?? []).map((c) => (
                          <TableRow key={c.id} className="border-border">
                            <TableCell className="font-medium text-foreground">
                              {`${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() ||
                                "—"}
                            </TableCell>
                            <TableCell className="text-foreground">
                              {c.phone}
                            </TableCell>
                            <TableCell className="text-foreground">
                              {fa(c.orderCount ?? 0)}
                            </TableCell>
                            <TableCell className="text-foreground">
                              {toman(c.totalSpent)}
                            </TableCell>
                            <TableCell className="text-foreground">
                              {daysSince(c.lastPurchaseAt)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
