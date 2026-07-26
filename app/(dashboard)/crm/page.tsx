"use client";

import { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Users,
  UserCheck,
  UserX,
  UserPlus,
  Loader2,
  RefreshCw,
  ArrowLeft,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import {
  useSegments,
  useCrmCustomers,
  useRfmSettings,
} from "@/features/crm/queries";
import {
  useRecomputeRfm,
  useUpdateRfmSettings,
} from "@/features/crm/mutations";
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

/** Distribution-bar color for each segment (filled). */
const segmentBarClass: Record<string, string> = {
  champion: "bg-primary",
  loyal: "bg-blue-500",
  active: "bg-green-500",
  new: "bg-cyan-500",
  at_risk: "bg-amber-500",
  lost: "bg-red-500",
  prospect: "bg-muted-foreground/40",
};

/** Segment badge color (light) — aligned with the customers page. */
const segmentBadgeClass: Record<string, string> = {
  champion: "bg-primary/15 text-primary border-primary/30",
  loyal: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  active: "bg-green-500/15 text-green-600 border-green-500/30",
  new: "bg-cyan-500/15 text-cyan-600 border-cyan-500/30",
  at_risk: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  lost: "bg-red-500/15 text-red-600 border-red-500/30",
  prospect: "",
};

/** Short description of each segment for display in the cards. */
const segmentHint: Record<string, string> = {
  champion: "خرید زیاد و اخیر — ارزشمندترین مشتریان",
  loyal: "خریدهای مکرر و پایدار",
  active: "خرید در بازه‌ی اخیر",
  new: "اولین خرید تازه انجام شده",
  at_risk: "قبلاً فعال بودند، مدتی است خرید نکرده‌اند",
  lost: "مدت زیادی است خریدی نداشته‌اند",
  prospect: "ثبت‌نام کرده اما هنوز خریدی نداشته",
};

type ThresholdForm = {
  championMinSpent: string;
  loyalMinOrders: string;
  atRiskDays: string;
  lostDays: string;
};

const THRESHOLD_FIELDS: {
  key: keyof ThresholdForm;
  label: string;
  hint: string;
  min: number;
}[] = [
  {
    key: "championMinSpent",
    label: "حداقل مبلغ خرید برای «قهرمان» (تومان)",
    hint: "مشتری با دست‌کم ۲ سفارش که مجموع خریدش از این مبلغ بیشتر باشد، قهرمان می‌شود.",
    min: 0,
  },
  {
    key: "loyalMinOrders",
    label: "حداقل تعداد سفارش برای «وفادار»",
    hint: "مشتری اخیر که به این تعداد سفارش رسیده ولی هنوز به مبلغ قهرمانی نرسیده، وفادار است.",
    min: 1,
  },
  {
    key: "atRiskDays",
    label: "روزهای بی‌خریدی تا «در معرض ریزش»",
    hint: "پس از این تعداد روز از آخرین خرید، مشتری در معرض ریزش علامت می‌خورد.",
    min: 1,
  },
  {
    key: "lostDays",
    label: "روزهای بی‌خریدی تا «از دست‌رفته»",
    hint: "باید بزرگ‌تر از روزهای «در معرض ریزش» باشد.",
    min: 1,
  },
];

/**
 * Editor for the RFM thresholds. Saving recomputes every customer's segment on the server,
 * so the dialog reports how many customers actually moved — that number is the only visible
 * confirmation that a threshold change did something.
 */
function RfmSettingsDialog() {
  const { data: settings, isLoading } = useRfmSettings();
  const update = useUpdateRfmSettings();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ThresholdForm | null>(null);

  // Re-seed whenever the dialog opens so a cancelled edit never sticks around.
  useEffect(() => {
    if (open && settings) {
      setForm({
        championMinSpent: String(settings.championMinSpent),
        loyalMinOrders: String(settings.loyalMinOrders),
        atRiskDays: String(settings.atRiskDays),
        lostDays: String(settings.lostDays),
      });
    }
  }, [open, settings]);

  const numbers = form && {
    championMinSpent: Number(form.championMinSpent),
    loyalMinOrders: Number(form.loyalMinOrders),
    atRiskDays: Number(form.atRiskDays),
    lostDays: Number(form.lostDays),
  };

  const daysOutOfOrder = !!numbers && numbers.atRiskDays >= numbers.lostDays;
  const hasBlank = !!form && Object.values(form).some((v) => v.trim() === "");
  const invalid =
    !numbers ||
    hasBlank ||
    daysOutOfOrder ||
    Object.values(numbers).some((v) => !Number.isFinite(v) || v < 0);

  const handleSave = async () => {
    if (!numbers || invalid) return;
    try {
      const res = await update.mutateAsync(numbers);
      toast.success(
        `معیارها ذخیره شد و ${fa(res.updated)} مشتری سگمنت یا امتیازشان تغییر کرد.`,
      );
      setOpen(false);
    } catch {
      /* Global toast */
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2" disabled={isLoading}>
          <SlidersHorizontal className="h-4 w-4" />
          تنظیم معیارها
        </Button>
      </DialogTrigger>
      <DialogContent dir="rtl" className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>معیارهای سگمنت‌بندی RFM</DialogTitle>
          <DialogDescription>
            با ذخیره‌ی این اعداد، سگمنت همه‌ی مشتریان بی‌درنگ دوباره محاسبه می‌شود.
          </DialogDescription>
        </DialogHeader>

        {!form ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {THRESHOLD_FIELDS.map((f) => (
              <div key={f.key} className="space-y-1.5">
                <Label htmlFor={f.key} className="text-sm">
                  {f.label}
                </Label>
                <Input
                  id={f.key}
                  type="number"
                  min={f.min}
                  dir="ltr"
                  className="text-left"
                  value={form[f.key]}
                  onChange={(e) =>
                    setForm({ ...form, [f.key]: e.target.value })
                  }
                />
                <p className="text-xs leading-5 text-muted-foreground">
                  {f.hint}
                </p>
              </div>
            ))}

            {daysOutOfOrder && (
              <p className="text-sm text-red-600">
                روزهای «در معرض ریزش» باید کمتر از روزهای «از دست‌رفته» باشد،
                وگرنه هیچ مشتری در سگمنت «در معرض ریزش» قرار نمی‌گیرد.
              </p>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            انصراف
          </Button>
          <Button
            onClick={handleSave}
            disabled={invalid || update.isPending}
            className="gap-2"
          >
            {update.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            ذخیره و بازمحاسبه
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

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
      toast.success(
        `بازمحاسبه انجام شد — سگمنت یا امتیاز ${fa(res.updated)} مشتری تغییر کرد.`,
      );
    } catch {
      /* Global toast */
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
        description="نمای کلی سگمنت‌بندی مشتریان بر اساس تحلیل RFM. سگمنت‌ها هر شب ساعت ۳ بامداد به‌صورت خودکار به‌روز می‌شوند."
      />

      <div className="flex-1 space-y-6 p-6">
        {/* Actions */}
        <div className="flex items-center justify-between">
          <Link href="/customers">
            <Button variant="outline" className="gap-2">
              مشاهده‌ی فهرست کامل مشتریان
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <RfmSettingsDialog />
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

            {/* Segment distribution */}
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

            {/* Segment cards */}
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

            {/* Top customers (champions) */}
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
