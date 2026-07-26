"use client";

import { useState } from "react";
import { toast } from "sonner";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Send, Loader2, Megaphone } from "lucide-react";
import {
  useSmsTemplates,
  useSmsStats,
  useSmsMessages,
  useSmsCampaigns,
} from "@/features/sms/queries";
import {
  useCreateSmsTemplate,
  useUpdateSmsTemplate,
  useDeleteSmsTemplate,
  useSendTestSms,
  useCreateCampaign,
  usePreviewCampaign,
  useSendCampaign,
} from "@/features/sms/mutations";
import type {
  SmsTemplate,
  SmsEvent,
  CustomerFilter,
} from "@/features/sms/sms-api";
import { SEGMENT_LABELS, SEGMENT_ORDER } from "@/features/crm/crm-api";
import { OrderStatus } from "@/features/order/order-api";

const EVENT_LABELS: Record<SmsEvent, string> = {
  purchase_paid: "پس از پرداخت",
  order_status: "تغییر وضعیت سفارش",
  promotional: "تبلیغاتی",
};

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  awaiting_payment: "در انتظار پرداخت",
  paid: "تأیید شد",
  processing: "در حال آماده‌سازی",
  shipped: "ارسال شد",
  delivered: "تحویل شد",
  cancelled: "لغو شد",
  refunded: "مرجوع شد",
};

const ORDER_STATUSES = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[];
const PLACEHOLDER_HINT =
  "{name} نام کاربر • {pet} نام پت • {orderNumber} شماره سفارش • {status} وضعیت • {amount} مبلغ";

const emptyTemplate = {
  id: "",
  name: "",
  body: "",
  event: "promotional" as SmsEvent,
  orderStatus: undefined as OrderStatus | undefined,
  isActive: true,
};

export default function SmsPage() {
  return (
    <div className="flex flex-col" dir="rtl">
      <Header
        title="پیامک"
        description="قالب‌ها، کمپین‌های تبلیغاتی و گزارش‌ها."
      />
      <div className="flex-1 p-6">
        <Tabs defaultValue="templates" dir="rtl">
          <TabsList>
            <TabsTrigger value="templates">قالب‌ها</TabsTrigger>
            <TabsTrigger value="campaigns">کمپین‌ها</TabsTrigger>
            <TabsTrigger value="stats">گزارش‌ها</TabsTrigger>
          </TabsList>
          <TabsContent value="templates" className="mt-4">
            <TemplatesTab />
          </TabsContent>
          <TabsContent value="campaigns" className="mt-4">
            <CampaignsTab />
          </TabsContent>
          <TabsContent value="stats" className="mt-4">
            <StatsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Templates tab
// ---------------------------------------------------------------------------
function TemplatesTab() {
  const { data: templates = [], isLoading } = useSmsTemplates();
  const createM = useCreateSmsTemplate();
  const updateM = useUpdateSmsTemplate();
  const deleteM = useDeleteSmsTemplate();
  const sendTestM = useSendTestSms();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyTemplate);
  const [testPhone, setTestPhone] = useState("");
  const [testFor, setTestFor] = useState<string | null>(null);

  const openCreate = () => {
    setForm(emptyTemplate);
    setOpen(true);
  };
  const openEdit = (t: SmsTemplate) => {
    setForm({
      id: t.id,
      name: t.name,
      body: t.body,
      event: t.event,
      orderStatus: t.orderStatus ?? undefined,
      isActive: t.isActive,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.name || !form.body) {
      toast.error("نام و متن قالب الزامی است");
      return;
    }
    const payload = {
      name: form.name,
      body: form.body,
      event: form.event,
      orderStatus: form.event === "order_status" ? form.orderStatus : undefined,
      isActive: form.isActive,
    };
    try {
      if (form.id) await updateM.mutateAsync({ id: form.id, data: payload });
      else await createM.mutateAsync(payload);
      setOpen(false);
      toast.success("قالب ذخیره شد");
    } catch {
      /* Global toast */
    }
  };

  const toggleActive = (t: SmsTemplate) =>
    updateM.mutate({ id: t.id, data: { isActive: !t.isActive } });

  const remove = async (id: string) => {
    if (!confirm("حذف این قالب؟")) return;
    await deleteM.mutateAsync(id);
  };

  const sendTest = async () => {
    if (!testFor || !testPhone) return;
    try {
      await sendTestM.mutateAsync({ templateId: testFor, phone: testPhone });
      toast.success("پیامک آزمایشی ارسال شد (یا در حالت شبیه‌سازی لاگ شد)");
      setTestFor(null);
      setTestPhone("");
    } catch {
      /* Global toast */
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" /> قالب جدید
        </Button>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>قالب‌های پیامک</CardTitle>
          <CardDescription>
            قالب‌های تراکنشی (خرید/وضعیت) و پایه‌ی تبلیغاتی. با سوییچ
            فعال/غیرفعال می‌شوند.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">نام</TableHead>
                  <TableHead className="text-right">رویداد</TableHead>
                  <TableHead className="text-right">وضعیت سفارش</TableHead>
                  <TableHead className="text-right">فعال</TableHead>
                  <TableHead className="text-left">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{EVENT_LABELS[t.event]}</Badge>
                    </TableCell>
                    <TableCell>
                      {t.orderStatus ? ORDER_STATUS_LABELS[t.orderStatus] : "—"}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={t.isActive}
                        onCheckedChange={() => toggleActive(t)}
                      />
                    </TableCell>
                    <TableCell className="text-left">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setTestFor(t.id)}
                          aria-label="ارسال آزمایشی"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(t)}
                          aria-label="ویرایش"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(t.id)}
                          aria-label="حذف"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {templates.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground py-6"
                    >
                      هنوز قالبی ساخته نشده است.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/edit template dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>{form.id ? "ویرایش قالب" : "قالب جدید"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>نام قالب</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="مثلاً تأیید خرید"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>رویداد</Label>
                <Select
                  value={form.event}
                  onValueChange={(v) =>
                    setForm({ ...form, event: v as SmsEvent })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(EVENT_LABELS) as SmsEvent[]).map((e) => (
                      <SelectItem key={e} value={e}>
                        {EVENT_LABELS[e]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {form.event === "order_status" && (
                <div className="space-y-2">
                  <Label>وضعیت سفارش</Label>
                  <Select
                    value={form.orderStatus ?? ""}
                    onValueChange={(v) =>
                      setForm({ ...form, orderStatus: v as OrderStatus })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب وضعیت" />
                    </SelectTrigger>
                    <SelectContent>
                      {ORDER_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {ORDER_STATUS_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>متن پیامک</Label>
              <Textarea
                rows={4}
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                placeholder="سلام {name} عزیز، سفارش {orderNumber} شما ثبت شد."
              />
              <p className="text-xs text-muted-foreground">
                {PLACEHOLDER_HINT}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => setForm({ ...form, isActive: v })}
              />
              <Label>فعال</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={save}
              disabled={createM.isPending || updateM.isPending}
            >
              ذخیره
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test-send dialog */}
      <Dialog open={!!testFor} onOpenChange={(o) => !o && setTestFor(null)}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>ارسال آزمایشی</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>شماره موبایل</Label>
            <Input
              dir="ltr"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder="09xxxxxxxxx"
            />
          </div>
          <DialogFooter>
            <Button onClick={sendTest} disabled={sendTestM.isPending}>
              {sendTestM.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              ارسال
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Campaigns tab
// ---------------------------------------------------------------------------
const CAMPAIGN_STATUS_LABELS: Record<string, string> = {
  draft: "پیش‌نویس",
  sending: "در حال ارسال",
  sent: "ارسال‌شده",
  failed: "ناموفق",
};

function CampaignsTab() {
  const { data: response, isLoading } = useSmsCampaigns(1, 50);
  const createM = useCreateCampaign();
  const previewM = usePreviewCampaign();
  const sendM = useSendCampaign();

  const campaigns = response?.data ?? [];
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [filters, setFilters] = useState<CustomerFilter>({});
  const [previewCount, setPreviewCount] = useState<number | null>(null);

  const setF = (patch: Partial<CustomerFilter>) => {
    setFilters((f) => ({ ...f, ...patch }));
    setPreviewCount(null);
  };

  const reset = () => {
    setName("");
    setBody("");
    setFilters({});
    setPreviewCount(null);
  };

  const preview = async () => {
    const res = await previewM.mutateAsync(filters);
    setPreviewCount(res.count);
  };

  const create = async () => {
    if (!name || !body) {
      toast.error("نام و متن کمپین الزامی است");
      return;
    }
    try {
      await createM.mutateAsync({ name, body, filters });
      toast.success("کمپین ساخته شد");
      setOpen(false);
      reset();
    } catch {
      /* Global toast */
    }
  };

  const send = async (id: string) => {
    if (!confirm("ارسال این کمپین به همه‌ی گیرنده‌ها؟")) return;
    try {
      const res = await sendM.mutateAsync(id);
      toast.success(
        `ارسال شد: ${res.sentCount} موفق، ${res.failedCount} ناموفق`,
      );
    } catch {
      /* Global toast */
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog
          open={open}
          onOpenChange={(o) => {
            setOpen(o);
            if (!o) reset();
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Megaphone className="h-4 w-4" /> کمپین جدید
            </Button>
          </DialogTrigger>
          <DialogContent
            dir="rtl"
            className="max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <DialogHeader>
              <DialogTitle>کمپین تبلیغاتی جدید</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>نام کمپین</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>متن پیامک</Label>
                <Textarea
                  rows={3}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="سلام {name} عزیز، برای {pet} تخفیف ویژه داریم!"
                />
                <p className="text-xs text-muted-foreground">
                  {"{name} نام کاربر • {pet} نام پت"}
                </p>
              </div>

              <div className="rounded-md border p-3 space-y-3">
                <p className="text-sm font-medium">هدف‌گیری گیرنده‌ها</p>
                <div className="space-y-2">
                  <Label className="text-xs">سگمنت</Label>
                  <Select
                    value={filters.segment ?? "all"}
                    onValueChange={(v) =>
                      setF({ segment: v === "all" ? undefined : v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">همه</SelectItem>
                      {SEGMENT_ORDER.map((s) => (
                        <SelectItem key={s} value={s}>
                          {SEGMENT_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">حداقل مبلغ کل (تومان)</Label>
                    <Input
                      type="number"
                      value={filters.minSpent ?? ""}
                      onChange={(e) =>
                        setF({
                          minSpent: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">حداقل تعداد سفارش</Label>
                    <Input
                      type="number"
                      value={filters.minOrders ?? ""}
                      onChange={(e) =>
                        setF({
                          minOrders: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">آخرین خرید در N روز اخیر</Label>
                    <Input
                      type="number"
                      value={filters.lastPurchaseWithinDays ?? ""}
                      onChange={(e) =>
                        setF({
                          lastPurchaseWithinDays: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">
                      آخرین خرید قدیمی‌تر از N روز
                    </Label>
                    <Input
                      type="number"
                      value={filters.lastPurchaseOlderThanDays ?? ""}
                      onChange={(e) =>
                        setF({
                          lastPurchaseOlderThanDays: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">نوع حیوان خانگی</Label>
                  <Select
                    value={filters.petType ?? "all"}
                    onValueChange={(v) =>
                      setF({ petType: v === "all" ? undefined : v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">همه</SelectItem>
                      <SelectItem value="dog">سگ</SelectItem>
                      <SelectItem value="cat">گربه</SelectItem>
                      <SelectItem value="bird">پرنده</SelectItem>
                      <SelectItem value="other">سایر</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={preview}
                  disabled={previewM.isPending}
                >
                  {previewM.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  پیش‌نمایش تعداد گیرنده
                </Button>
                {previewCount !== null && (
                  <p className="text-sm text-primary">
                    {previewCount.toLocaleString("fa-IR")} گیرنده
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button onClick={create} disabled={createM.isPending}>
                ذخیره‌ی کمپین
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>کمپین‌ها</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">نام</TableHead>
                  <TableHead className="text-right">وضعیت</TableHead>
                  <TableHead className="text-right">گیرنده</TableHead>
                  <TableHead className="text-right">موفق</TableHead>
                  <TableHead className="text-right">ناموفق</TableHead>
                  <TableHead className="text-left">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {CAMPAIGN_STATUS_LABELS[c.status] ?? c.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {c.totalRecipients.toLocaleString("fa-IR")}
                    </TableCell>
                    <TableCell>{c.sentCount.toLocaleString("fa-IR")}</TableCell>
                    <TableCell>
                      {c.failedCount.toLocaleString("fa-IR")}
                    </TableCell>
                    <TableCell className="text-left">
                      {(c.status === "draft" || c.status === "failed") && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => send(c.id)}
                          disabled={sendM.isPending}
                        >
                          <Send className="h-3.5 w-3.5" /> ارسال
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {campaigns.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground py-6"
                    >
                      هنوز کمپینی ساخته نشده است.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Reports tab
// ---------------------------------------------------------------------------
const MSG_STATUS_LABELS: Record<string, string> = {
  sent: "ارسال‌شده",
  failed: "ناموفق",
  pending: "در انتظار",
};

function StatsTab() {
  const { data: stats } = useSmsStats();
  const { data: messages } = useSmsMessages(1, 20);

  const cards = [
    { label: "کل ارسال موفق", value: stats?.totalSent ?? 0 },
    { label: "ناموفق", value: stats?.totalFailed ?? 0 },
    { label: "کل پیام‌ها", value: stats?.total ?? 0 },
    { label: "نرخ موفقیت (٪)", value: stats?.successRate ?? 0 },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="bg-card border-border">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{c.label}</p>
              <p className="text-2xl font-bold text-foreground">
                {c.value.toLocaleString("fa-IR")}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>آخرین پیام‌ها</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">موبایل</TableHead>
                <TableHead className="text-right">متن</TableHead>
                <TableHead className="text-right">نوع</TableHead>
                <TableHead className="text-right">وضعیت</TableHead>
                <TableHead className="text-right">تاریخ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(messages?.data ?? []).map((m) => (
                <TableRow key={m.id}>
                  <TableCell dir="ltr" className="text-right">
                    {m.phone}
                  </TableCell>
                  <TableCell className="max-w-[240px] truncate">
                    {m.body}
                  </TableCell>
                  <TableCell>{m.type}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        m.status === "sent"
                          ? "bg-green-500/15 text-green-600 border-green-500/30"
                          : m.status === "failed"
                            ? "bg-red-500/15 text-red-600 border-red-500/30"
                            : ""
                      }
                    >
                      {MSG_STATUS_LABELS[m.status] ?? m.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(m.createdAt).toLocaleDateString("fa-IR")}
                  </TableCell>
                </TableRow>
              ))}
              {(messages?.data?.length ?? 0) === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground py-6"
                  >
                    هنوز پیامی ارسال نشده است.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
