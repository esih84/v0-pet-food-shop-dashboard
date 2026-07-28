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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { useSegments, useSegmentCounts } from "@/features/crm/queries";
import {
  useCreateSegment,
  useUpdateSegment,
  useDeleteSegment,
  useReorderSegments,
} from "@/features/crm/mutations";
import {
  SEGMENT_COLORS,
  type RfmSegment,
  type RfmSegmentInput,
  type SegmentColor,
} from "@/features/crm/crm-api";
import {
  SEGMENT_COLOR_LABELS,
  describeRule,
  segmentClasses,
} from "@/features/crm/segment-display";
import {
  RfmRangeFields,
  type RfmBounds,
} from "@/components/dashboard/rfm-range-fields";

const fa = (n: number) => n.toLocaleString("fa-IR");

type GuardKey = "minSpent" | "minOrders" | "maxDaysSincePurchase";

const GUARDS: { key: GuardKey; label: string; hint: string }[] = [
  {
    key: "minSpent",
    label: "حداقل مبلغ کل خرید (تومان)",
    hint: "شرط مطلق، مستقل از رتبه‌ی نسبی",
  },
  { key: "minOrders", label: "حداقل تعداد سفارش", hint: "شرط مطلق" },
  {
    key: "maxDaysSincePurchase",
    label: "حداکثر روز از آخرین خرید",
    hint: "شرط مطلق",
  },
];

type FormState = {
  key: string;
  label: string;
  description: string;
  color: SegmentColor;
  isActive: boolean;
  bounds: RfmBounds;
  guards: Record<GuardKey, string>;
};

const emptyForm: FormState = {
  key: "",
  label: "",
  description: "",
  color: "gray",
  isActive: true,
  bounds: {},
  guards: { minSpent: "", minOrders: "", maxDaysSincePurchase: "" },
};

function toForm(segment: RfmSegment): FormState {
  return {
    key: segment.key,
    label: segment.label,
    description: segment.description ?? "",
    color: segment.color,
    isActive: segment.isActive,
    bounds: {
      minR: segment.minR,
      maxR: segment.maxR,
      minF: segment.minF,
      maxF: segment.maxF,
      minM: segment.minM,
      maxM: segment.maxM,
    },
    guards: {
      minSpent: segment.minSpent == null ? "" : String(Number(segment.minSpent)),
      minOrders: segment.minOrders == null ? "" : String(segment.minOrders),
      maxDaysSincePurchase:
        segment.maxDaysSincePurchase == null
          ? ""
          : String(segment.maxDaysSincePurchase),
    },
  };
}

/** Blank guard inputs are sent as null so the server clears any stored value. */
function toPayload(form: FormState): RfmSegmentInput {
  const guard = (raw: string) => (raw.trim() === "" ? null : Number(raw));
  return {
    key: form.key.trim(),
    label: form.label.trim(),
    description: form.description.trim() || null,
    color: form.color,
    isActive: form.isActive,
    minR: form.bounds.minR ?? null,
    maxR: form.bounds.maxR ?? null,
    minF: form.bounds.minF ?? null,
    maxF: form.bounds.maxF ?? null,
    minM: form.bounds.minM ?? null,
    maxM: form.bounds.maxM ?? null,
    minSpent: guard(form.guards.minSpent),
    minOrders: guard(form.guards.minOrders),
    maxDaysSincePurchase: guard(form.guards.maxDaysSincePurchase),
  };
}

function SegmentDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: RfmSegment | null;
}) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const create = useCreateSegment();
  const update = useUpdateSegment();
  const pending = create.isPending || update.isPending;

  useEffect(() => {
    if (open) setForm(editing ? toForm(editing) : emptyForm);
  }, [open, editing]);

  const keyInvalid =
    form.key.trim() !== "" && !/^[a-z0-9_]+$/.test(form.key.trim());
  const invalid = !form.key.trim() || !form.label.trim() || keyInvalid;

  const save = async () => {
    if (invalid) return;
    try {
      const res = editing
        ? await update.mutateAsync({ id: editing.id, input: toPayload(form) })
        : await create.mutateAsync(toPayload(form));
      toast.success(
        `ذخیره شد — سگمنت ${fa(res.updated)} مشتری دوباره محاسبه شد.`,
      );
      onOpenChange(false);
    } catch {
      /* Global toast */
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editing ? `ویرایش «${editing.label}»` : "سطح مشتری جدید"}
          </DialogTitle>
          <DialogDescription>
            هر سطح یک قاعده روی امتیازهای R/F/M است. با ذخیره، سگمنت همه‌ی
            مشتریان بی‌درنگ دوباره محاسبه می‌شود.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">نام نمایشی</Label>
              <Input
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="مثلاً: پرارزشِ در حال ریزش"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">کلید (انگلیسی)</Label>
              <Input
                dir="ltr"
                className="text-left"
                value={form.key}
                disabled={!!editing?.systemRole}
                onChange={(e) => setForm({ ...form, key: e.target.value })}
                placeholder="high_value_at_risk"
              />
              {keyInvalid && (
                <p className="text-[11px] text-red-600">
                  فقط حروف کوچک انگلیسی، عدد و _
                </p>
              )}
              {editing?.systemRole && (
                <p className="text-[11px] text-muted-foreground">
                  کلید سطوح سیستمی قابل تغییر نیست.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">توضیح</Label>
            <Input
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="در کارت داشبورد نمایش داده می‌شود"
            />
          </div>

          <div className="grid grid-cols-2 items-end gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">رنگ</Label>
              <Select
                value={form.color}
                onValueChange={(v) =>
                  setForm({ ...form, color: v as SegmentColor })
                }
              >
                <SelectTrigger className="bg-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEGMENT_COLORS.map((c) => (
                    <SelectItem key={c} value={c}>
                      <span className="flex items-center gap-2">
                        <span
                          className={`inline-block h-3 w-3 rounded-full ${segmentClasses(c).dot}`}
                        />
                        {SEGMENT_COLOR_LABELS[c]}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 pb-2">
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => setForm({ ...form, isActive: v })}
              />
              <Label className="text-xs">فعال</Label>
            </div>
          </div>

          {editing?.systemRole ? (
            <div className="rounded-md border border-border bg-muted/40 p-3">
              <p className="text-xs leading-5 text-muted-foreground">
                این سطح مستقیماً به مشتریانی داده می‌شود که هیچ خریدی نکرده‌اند.
                چون امتیاز R/F/M ندارند، قاعده‌ی بازه‌ای برایشان معنا ندارد و
                فقط نام، توضیح و رنگ آن قابل تغییر است.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3 rounded-md border border-border p-3">
                <p className="text-sm font-medium">بازه‌ی امتیازها</p>
                <p className="text-xs leading-5 text-muted-foreground">
                  خالی گذاشتن هر طرف یعنی بی‌کران. اگر همه خالی بماند، این سطح
                  همه‌ی مشتریان را می‌گیرد.
                </p>
                <RfmRangeFields
                  value={form.bounds}
                  onChange={(bounds) => setForm({ ...form, bounds })}
                  clearAs="null"
                />
              </div>

              <div className="space-y-3 rounded-md border border-border p-3">
                <p className="text-sm font-medium">شرط‌های مطلق (اختیاری)</p>
                <p className="text-xs leading-5 text-muted-foreground">
                  امتیازها نسبی‌اند، پس در فروشگاه کم‌مشتری ممکن است «۲۰٪ برتر»
                  هم خرید کوچکی داشته باشد. این شرط‌ها عدد واقعی را هم الزامی
                  می‌کنند.
                </p>
                {GUARDS.map((g) => (
                  <div key={g.key} className="space-y-1.5">
                    <Label className="text-xs">{g.label}</Label>
                    <Input
                      type="number"
                      min={0}
                      dir="ltr"
                      className="text-left"
                      value={form.guards[g.key]}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          guards: { ...form.guards, [g.key]: e.target.value },
                        })
                      }
                      placeholder="بدون شرط"
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            انصراف
          </Button>
          <Button onClick={save} disabled={invalid || pending} className="gap-2">
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            ذخیره و بازمحاسبه
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function SegmentsPage() {
  const { data: segments, isLoading } = useSegments();
  const { data: counts } = useSegmentCounts();
  const reorder = useReorderSegments();
  const remove = useDeleteSegment();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<RfmSegment | null>(null);

  const rows = segments ?? [];
  const unclassified = counts?.unclassified ?? 0;

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (segment: RfmSegment) => {
    setEditing(segment);
    setDialogOpen(true);
  };

  const move = async (index: number, direction: -1 | 1) => {
    const next = [...rows];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    try {
      await reorder.mutateAsync(next.map((s) => s.id));
    } catch {
      /* Global toast */
    }
  };

  const handleDelete = async (segment: RfmSegment) => {
    if (!confirm(`سطح «${segment.label}» حذف شود؟`)) return;
    try {
      const res = await remove.mutateAsync(segment.id);
      toast.success(`حذف شد — ${fa(res.updated)} مشتری دوباره محاسبه شد.`);
    } catch {
      /* Global toast */
    }
  };

  return (
    <div className="flex flex-col" dir="rtl">
      <Header
        title="سطوح مشتری (RFM)"
        description="هر سطح یک قاعده روی امتیازهای R/F/M است. مشتری به اولین سطحی که با آن جور شود تعلق می‌گیرد، پس ترتیب اهمیت دارد."
      />

      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <Link href="/crm">
            <Button variant="outline" className="gap-2">
              بازگشت به CRM
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Button className="gap-2" onClick={openNew}>
            <Plus className="h-4 w-4" />
            سطح جدید
          </Button>
        </div>

        {unclassified > 0 && (
          <Card className="border-amber-500/40 bg-amber-500/5">
            <CardContent className="p-4 text-sm leading-6">
              <span className="font-medium text-amber-600">
                {fa(unclassified)} مشتری با هیچ سطحی جور در نیامده‌اند.
              </span>{" "}
              برای پوشش آن‌ها یک سطح با بازه‌های خالی در پایین‌ترین اولویت
              بسازید، یا بازه‌ی سطوح موجود را بازتر کنید.
            </CardContent>
          </Card>
        )}

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">
              ترتیب ارزیابی سطوح
            </CardTitle>
            <CardDescription>
              از بالا به پایین بررسی می‌شوند و اولین تطابق برنده است.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : rows.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                هنوز سطحی تعریف نشده است.
              </p>
            ) : (
              rows.map((segment, index) => (
                <div
                  key={segment.id}
                  className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center"
                >
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      disabled={index === 0 || reorder.isPending}
                      onClick={() => move(index, -1)}
                      aria-label="انتقال به بالا"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      disabled={index === rows.length - 1 || reorder.isPending}
                      onClick={() => move(index, 1)}
                      aria-label="انتقال به پایین"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className={segmentClasses(segment.color).badge}
                      >
                        {segment.label}
                      </Badge>
                      <span
                        className="font-mono text-xs text-muted-foreground"
                        dir="ltr"
                      >
                        {segment.key}
                      </span>
                      {segment.systemRole && (
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Lock className="h-3 w-3" />
                          سیستمی
                        </span>
                      )}
                      {!segment.isActive && (
                        <Badge variant="secondary" className="text-[10px]">
                          غیرفعال
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground" dir="rtl">
                      {segment.systemRole
                        ? "به مشتریان بدون خرید داده می‌شود"
                        : describeRule(segment)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="whitespace-nowrap text-sm text-muted-foreground">
                      {fa(counts?.[segment.key] ?? 0)} مشتری
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(segment)}
                      aria-label="ویرایش"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={!!segment.systemRole || remove.isPending}
                      onClick={() => handleDelete(segment)}
                      aria-label="حذف"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <SegmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
      />
    </div>
  );
}
