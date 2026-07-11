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
  UserX,
  UserPlus,
  Loader2,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { useSegments, useCrmCustomers } from "@/features/crm/queries";
import { useRecomputeRfm } from "@/features/crm/mutations";
import { SEGMENT_LABELS, SEGMENT_ORDER } from "@/features/crm/crm-api";

const fa = (v: number) => v.toLocaleString("fa-IR");

const toman = (v?: number | null) =>
  v ? `${Math.round(Number(v)).toLocaleString("fa-IR")} تومان` : "—";

function daysSince(date?: string | null): string {
  if (!date) return "—";
  const d = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  if (d <= 0) return "امروز";
  return `${d.toLocaleString("fa-IR")} روز پیش`;
}

/** رنگ نوار توزیع هر سگمنت (پرشده). */
const segmentBarClass: Record<string, string> = {
  champion: "bg-primary",
  loyal: "bg-blue-500",
  active: "bg-green-500",
  new: "bg-cyan-500",
  at_risk: "bg-amber-500",
  lost: "bg-red-500",
  prospect: "bg-muted-foreground/40",
};

/** رنگ بج سگمنت (کم‌رنگ) — هم‌راستا با صفحه‌ی مشتریان. */
const segmentBadgeClass: Record<string, string> = {
  champion: "bg-primary/15 text-primary border-primary/30",
  loyal: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  active: "bg-green-500/15 text-green-600 border-green-500/30",
  new: "bg-cyan-500/15 text-cyan-600 border-cyan-500/30",
  at_risk: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  lost: "bg-red-500/15 text-red-600 border-red-500/30",
  prospect: "",
};

/** توضیح کوتاه هر سگمنت برای نمایش در کارت‌ها. */
const segmentHint: Record<string, string> = {
  champion: "خرید زیاد و اخیر — ارزشمندترین مشتریان",
  loyal: "خریدهای مکرر و پایدار",
  active: "خرید در بازه‌ی اخیر",
  new: "اولین خرید تازه انجام شده",
  at_risk: "قبلاً فعال بودند، مدتی است خرید نکرده‌اند",
  lost: "مدت زیادی است خریدی نداشته‌اند",
  prospect: "ثبت‌نام کرده اما هنوز خریدی نداشته",
};

export default function CrmPage() {
  const { data: segments, isLoading } = useSegments();
  const { data: vip } = useCrmCustomers({
    segment: "champion",
    page: 1,
    limit: 5,
  });
  const recompute = useRecomputeRfm();

  const counts = segments ?? {};
  const total = SEGMENT_ORDER.reduce((s, k) => s + (counts[k] ?? 0), 0);
  const maxCount = Math.max(1, ...SEGMENT_ORDER.map((k) => counts[k] ?? 0));

  const activeBuyers =
    (counts.champion ?? 0) + (counts.loyal ?? 0) + (counts.active ?? 0);
  const slipping = (counts.at_risk ?? 0) + (counts.lost ?? 0);
  const prospects = counts.prospect ?? 0;

  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);

  const handleRecompute = async () => {
    try {
      const res = await recompute.mutateAsync();
      toast.success(`بازمحاسبه انجام شد (${fa(res.updated)} مشتری).`);
    } catch {
      /* toast سراسری */
    }
  };

  const vipCustomers = vip?.data ?? [];

  const kpis = [
    {
      label: "کل مشتریان",
      value: total,
      icon: Users,
      color: "text-foreground",
      bg: "bg-muted",
    },
    {
      label: "مشتریان فعال",
      value: activeBuyers,
      icon: UserCheck,
      color: "text-green-600",
      bg: "bg-green-500/10",
    },
    {
      label: "در معرض ریزش / از دست‌رفته",
      value: slipping,
      icon: UserX,
      color: "text-amber-600",
      bg: "bg-amber-500/10",
    },
    {
      label: "بدون خرید",
      value: prospects,
      icon: UserPlus,
      color: "text-muted-foreground",
      bg: "bg-muted",
    },
  ];

  return (
    <div className="flex flex-col" dir="rtl">
      <Header
        title="مدیریت ارتباط با مشتری (CRM)"
        description="نمای کلی سگمنت‌بندی مشتریان بر اساس تحلیل RFM."
      />

      <div className="flex-1 space-y-6 p-6">
        {/* اکشن‌ها */}
        <div className="flex items-center justify-between">
          <Link href="/customers">
            <Button variant="outline" className="gap-2">
              مشاهده‌ی فهرست کامل مشتریان
              <ArrowLeft className="h-4 w-4" />
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

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* KPIها */}
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

            {/* توزیع سگمنت‌ها */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">
                  توزیع سگمنت‌ها
                </CardTitle>
                <CardDescription>
                  سهم هر سگمنت از کل {fa(total)} مشتری
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {SEGMENT_ORDER.map((s) => {
                  const n = counts[s] ?? 0;
                  return (
                    <div key={s} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">
                          {SEGMENT_LABELS[s]}
                        </span>
                        <span className="text-muted-foreground">
                          {fa(n)} نفر ({fa(pct(n))}٪)
                        </span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full transition-all ${
                            segmentBarClass[s] || "bg-primary"
                          }`}
                          style={{ width: `${(n / maxCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* کارت‌های سگمنت */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {SEGMENT_ORDER.map((s) => {
                const n = counts[s] ?? 0;
                return (
                  <Card key={s} className="border-border bg-card">
                    <CardContent className="space-y-2 p-5">
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="outline"
                          className={segmentBadgeClass[s] || ""}
                        >
                          {SEGMENT_LABELS[s]}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {fa(pct(n))}٪
                        </span>
                      </div>
                      <p className="text-3xl font-bold text-foreground">
                        {fa(n)}
                      </p>
                      <p className="text-xs leading-5 text-muted-foreground">
                        {segmentHint[s]}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* مشتریان ویژه (قهرمان) */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">
                  مشتریان ویژه (قهرمان)
                </CardTitle>
                <CardDescription>
                  ارزشمندترین مشتریان بر اساس تحلیل RFM
                </CardDescription>
              </CardHeader>
              <CardContent>
                {vipCustomers.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    هنوز مشتری قهرمانی وجود ندارد.
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
                      {vipCustomers.map((c) => (
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
          </>
        )}
      </div>
    </div>
  );
}
