"use client";

import { useMemo, useState } from "react";
import { Header } from "@/components/dashboard/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { JalaliDatePicker } from "@/components/ui/jalali-date-picker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, Pencil, Loader2, Lock } from "lucide-react";
import {
  useCancellationReasons,
  useReasonStats,
} from "@/features/cancellation-reason/queries";
import {
  useCreateCancellationReason,
  useUpdateCancellationReason,
  useDeleteCancellationReason,
} from "@/features/cancellation-reason/mutations";
import type { CancellationReason } from "@/features/cancellation-reason/cancellation-reason-api";
import { DataPagination } from "@/components/dashboard/data-pagination";
import { PAGE_SIZE } from "@/lib/pagination";

const fa = (v: number) => v.toLocaleString("fa-IR");

/** Local YYYY-MM-DD (no timezone shift) for the Jalali picker + query. */
const localISO = (d: Date) => {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
};

const BAR_COLORS = [
  "bg-primary",
  "bg-blue-500",
  "bg-green-500",
  "bg-amber-500",
  "bg-red-500",
  "bg-cyan-500",
  "bg-indigo-500",
  "bg-pink-500",
];

const emptyForm = { label: "", order: "0", isActive: true };

export default function CancellationReasonsPage() {
  const [page, setPage] = useState(1);
  const { data: response, isLoading } = useCancellationReasons(page, PAGE_SIZE);
  const reasons = response?.data ?? [];

  const createReason = useCreateCancellationReason();
  const updateReason = useUpdateCancellationReason();
  const deleteReason = useDeleteCancellationReason();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const set = <K extends keyof typeof emptyForm>(
    key: K,
    val: (typeof emptyForm)[K],
  ) => setForm((f) => ({ ...f, [key]: val }));

  const resetDialog = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const openEdit = (r: CancellationReason) => {
    setEditingId(r.id);
    setForm({
      label: r.label,
      order: String(r.order ?? 0),
      isActive: r.isActive,
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.label.trim()) return;
    const data = {
      label: form.label.trim(),
      order: Number(form.order) || 0,
      isActive: form.isActive,
    };
    if (editingId) {
      await updateReason.mutateAsync({ id: editingId, data });
    } else {
      await createReason.mutateAsync(data);
    }
    resetDialog();
    setOpen(false);
  };

  const isSaving = createReason.isPending || updateReason.isPending;

  // Stats date range — defaults to the last 30 days.
  const [fromDate, setFromDate] = useState(
    localISO(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
  );
  const [toDate, setToDate] = useState(localISO(new Date()));

  const statsRange = useMemo(
    () => ({
      from: fromDate || undefined,
      // Make the end date inclusive through the end of its day.
      to: toDate ? `${toDate}T23:59:59` : undefined,
    }),
    [fromDate, toDate],
  );
  const { data: stats, isLoading: statsLoading } = useReasonStats(statsRange);

  const statRows = useMemo(() => {
    const items = stats?.items ?? [];
    const rows = items.map((i) => ({
      key: i.id,
      label: i.label,
      count: i.count,
      percentage: i.percentage,
    }));
    if ((stats?.unknownCount ?? 0) > 0) {
      rows.push({
        key: "__unknown__",
        label: "نامشخص",
        count: stats!.unknownCount,
        percentage: stats!.unknownPercentage,
      });
    }
    return rows;
  }, [stats]);

  const maxCount = Math.max(1, ...statRows.map((r) => r.count));

  return (
    <div className="flex flex-col" dir="rtl">
      <Header
        title="دلایل لغو سفارش"
        description="مدیریت دلایل لغو و مشاهده‌ی سهم هر دلیل."
      />
      <div className="flex-1 p-6 space-y-6">
        {/* Distribution / stats */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <CardTitle className="text-foreground">
                  توزیع دلایل لغو
                </CardTitle>
                <CardDescription>
                  سهم هر دلیل از {fa(stats?.total ?? 0)} سفارش لغوشده در بازه‌ی
                  انتخابی
                </CardDescription>
              </div>
              <div className="flex items-end gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">از تاریخ</Label>
                  <JalaliDatePicker value={fromDate} onChange={setFromDate} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">تا تاریخ</Label>
                  <JalaliDatePicker value={toDate} onChange={setToDate} />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {statsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (stats?.total ?? 0) === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">
                در این بازه سفارش لغوشده‌ای وجود ندارد.
              </p>
            ) : (
              statRows.map((r, idx) => (
                <div key={r.key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">
                      {r.label}
                    </span>
                    <span className="text-muted-foreground">
                      {fa(r.count)} سفارش ({fa(r.percentage)}٪)
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all ${
                        r.key === "__unknown__"
                          ? "bg-muted-foreground/40"
                          : BAR_COLORS[idx % BAR_COLORS.length]
                      }`}
                      style={{ width: `${(r.count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* CRUD */}
        <div className="flex justify-end">
          <Dialog
            open={open}
            onOpenChange={(v) => {
              setOpen(v);
              if (!v) resetDialog();
            }}
          >
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={resetDialog}>
                <Plus className="h-4 w-4" /> دلیل جدید
              </Button>
            </DialogTrigger>
            <DialogContent dir="rtl" className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "ویرایش دلیل لغو" : "افزودن دلیل لغو"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>عنوان دلیل</Label>
                  <Input
                    value={form.label}
                    onChange={(e) => set("label", e.target.value)}
                    placeholder="مثلاً: انصراف مشتری"
                  />
                </div>
                <div className="space-y-2">
                  <Label>ترتیب نمایش</Label>
                  <Input
                    type="number"
                    value={form.order}
                    onChange={(e) => set("order", e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between rounded-md border border-input p-3">
                  <Label htmlFor="reason-active">فعال</Label>
                  <Switch
                    id="reason-active"
                    checked={form.isActive}
                    onCheckedChange={(v) => set("isActive", v)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleSubmit}
                  disabled={isSaving || !form.label.trim()}
                >
                  {isSaving && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
                  {editingId ? "ذخیره‌ی تغییرات" : "ذخیره"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">همه‌ی دلایل</CardTitle>
            <CardDescription>
              {(response?.total ?? 0).toLocaleString("fa-IR")} دلیل لغو
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
                    <TableHead className="text-muted-foreground text-right">
                      عنوان
                    </TableHead>
                    <TableHead className="text-muted-foreground text-right">
                      ترتیب
                    </TableHead>
                    <TableHead className="text-muted-foreground text-right">
                      نوع
                    </TableHead>
                    <TableHead className="text-muted-foreground text-right">
                      وضعیت
                    </TableHead>
                    <TableHead className="text-muted-foreground text-left">
                      عملیات
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reasons.map((r) => (
                    <TableRow key={r.id} className="border-border">
                      <TableCell className="font-medium text-foreground">
                        {r.label}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {fa(r.order ?? 0)}
                      </TableCell>
                      <TableCell>
                        {r.isSystem ? (
                          <Badge
                            variant="outline"
                            className="gap-1 bg-blue-500/15 text-blue-600 border-blue-500/30"
                          >
                            <Lock className="h-3 w-3" /> سیستمی
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-foreground">
                            سفارشی
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            r.isActive
                              ? "bg-green-500/15 text-green-600 border-green-500/30"
                              : "bg-gray-500/15 text-gray-600"
                          }
                        >
                          {r.isActive ? "فعال" : "غیرفعال"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-left">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(r)}
                            aria-label="ویرایش"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {!r.isSystem && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                if (confirm(`حذف دلیل «${r.label}»؟`))
                                  deleteReason.mutate(r.id);
                              }}
                              className="text-destructive hover:text-destructive"
                              aria-label="حذف"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
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
