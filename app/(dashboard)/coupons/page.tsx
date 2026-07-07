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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, Loader2, History } from "lucide-react";
import { useCoupons, useCouponUsages } from "@/features/coupon/queries";
import { useCreateCoupon, useDeleteCoupon } from "@/features/coupon/mutations";
import type { CouponType, CouponScope } from "@/features/coupon/coupon-api";
import { useCategories } from "@/features/category/queries";
import { useAdminProducts } from "@/features/product/queries";

const toman = (v: number) => `${Math.round(v).toLocaleString("fa-IR")} تومان`;

const typeLabel: Record<CouponType, string> = {
  percentage: "درصدی",
  fixed: "مبلغ ثابت",
  free_shipping: "ارسال رایگان",
};

const scopeLabel: Record<CouponScope, string> = {
  cart: "کل سبد",
  category: "دسته‌بندی",
  product: "کالا",
};

const emptyForm = {
  code: "",
  description: "",
  type: "percentage" as CouponType,
  scope: "cart" as CouponScope,
  value: "",
  minPurchase: "",
  maxDiscount: "",
  usageLimit: "",
  perUserLimit: "1",
  startDate: "",
  endDate: "",
  categoryIds: [] as string[],
  productIds: [] as string[],
};

export default function CouponsPage() {
  const { data: response, isLoading } = useCoupons();
  const coupons = response?.data ?? [];
  const createCoupon = useCreateCoupon();
  const deleteCoupon = useDeleteCoupon();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const set = <K extends keyof typeof emptyForm>(
    key: K,
    val: (typeof emptyForm)[K],
  ) => setForm((f) => ({ ...f, [key]: val }));

  // داده‌های انتخاب دامنه (دسته/کالا) — فقط وقتی نیاز است لود می‌شود
  const { data: categories = [] } = useCategories();
  const { data: productsRes } = useAdminProducts(1, 100);
  const products = productsRes?.data ?? [];

  const toggleId = (key: "categoryIds" | "productIds", id: string) =>
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(id)
        ? f[key].filter((x) => x !== id)
        : [...f[key], id],
    }));

  // تاریخچه‌ی استفاده
  const [historyOpen, setHistoryOpen] = useState(false);
  const { data: usagesRes, isLoading: usagesLoading } = useCouponUsages(
    1,
    50,
    undefined,
  );
  const usages = usagesRes?.data ?? [];

  const needsValue = form.type !== "free_shipping";

  const scopeReady =
    form.scope === "cart" ||
    (form.scope === "category" && form.categoryIds.length > 0) ||
    (form.scope === "product" && form.productIds.length > 0);

  const handleCreate = async () => {
    if (!form.code || (needsValue && !form.value) || !scopeReady) return;
    await createCoupon.mutateAsync({
      code: form.code.toUpperCase().trim(),
      description: form.description || undefined,
      type: form.type,
      scope: form.scope,
      value: needsValue ? Number(form.value) : 0,
      minPurchase: form.minPurchase ? Number(form.minPurchase) : undefined,
      maxDiscount:
        form.type === "percentage" && form.maxDiscount
          ? Number(form.maxDiscount)
          : undefined,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
      perUserLimit: form.perUserLimit ? Number(form.perUserLimit) : 1,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      categoryIds:
        form.scope === "category" ? form.categoryIds : undefined,
      productIds: form.scope === "product" ? form.productIds : undefined,
      isActive: true,
    });
    setForm(emptyForm);
    setOpen(false);
  };

  return (
    <div className="flex flex-col" dir="rtl">
      <Header title="کدهای تخفیف" description="مدیریت کوپن‌های تخفیف." />
      <div className="flex-1 p-6 space-y-6">
        <div className="flex justify-end gap-2">
          <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <History className="h-4 w-4" /> تاریخچه‌ی استفاده
              </Button>
            </DialogTrigger>
            <DialogContent dir="rtl" className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>تاریخچه‌ی استفاده از کدهای تخفیف</DialogTitle>
              </DialogHeader>
              <div className="max-h-[60vh] overflow-y-auto">
                {usagesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : usages.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8 text-sm">
                    هنوز هیچ کدی استفاده نشده است.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-muted-foreground text-right">
                          کد
                        </TableHead>
                        <TableHead className="text-muted-foreground text-right">
                          کاربر
                        </TableHead>
                        <TableHead className="text-muted-foreground text-right">
                          تخفیف اعمال‌شده
                        </TableHead>
                        <TableHead className="text-muted-foreground text-right">
                          تاریخ
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usages.map((u) => (
                        <TableRow key={u.id} className="border-border">
                          <TableCell className="font-medium text-foreground" dir="ltr">
                            {u.coupon?.code ?? "—"}
                          </TableCell>
                          <TableCell className="text-foreground">
                            {u.user
                              ? `${u.user.firstName ?? ""} ${u.user.lastName ?? ""}`.trim() ||
                                u.user.phone
                              : "—"}
                          </TableCell>
                          <TableCell className="text-foreground">
                            {toman(Number(u.discountApplied))}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(u.usedAt).toLocaleDateString("fa-IR")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> کد تخفیف جدید
              </Button>
            </DialogTrigger>
            <DialogContent dir="rtl" className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>افزودن کد تخفیف</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>کد</Label>
                  <Input
                    dir="ltr"
                    value={form.code}
                    onChange={(e) => set("code", e.target.value)}
                    placeholder="WELCOME10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>توضیح (اختیاری)</Label>
                  <Input
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    placeholder="مثلاً: تخفیف اولین خرید"
                  />
                </div>
                <div className="space-y-2">
                  <Label>نوع</Label>
                  <select
                    value={form.type}
                    onChange={(e) => set("type", e.target.value as CouponType)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="percentage">درصدی</option>
                    <option value="fixed">مبلغ ثابت</option>
                    <option value="free_shipping">ارسال رایگان</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>دامنه‌ی اعمال</Label>
                  <select
                    value={form.scope}
                    onChange={(e) =>
                      set("scope", e.target.value as CouponScope)
                    }
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="cart">کل سبد خرید</option>
                    <option value="category">دسته‌بندی مشخص</option>
                    <option value="product">کالای مشخص</option>
                  </select>
                  <p className="text-xs text-muted-foreground">
                    تخفیف فقط روی جمع اقلام واجد شرایط اعمال می‌شود.
                  </p>
                </div>
                {form.scope === "category" && (
                  <div className="space-y-2">
                    <Label>دسته‌بندی‌های مشمول</Label>
                    <div className="max-h-40 overflow-y-auto rounded-md border border-input p-2 space-y-1">
                      {categories.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-2 text-center">
                          دسته‌بندی‌ای موجود نیست.
                        </p>
                      ) : (
                        categories.map((c) => (
                          <label
                            key={c.id}
                            className="flex items-center gap-2 text-sm cursor-pointer py-1"
                          >
                            <input
                              type="checkbox"
                              checked={form.categoryIds.includes(c.id)}
                              onChange={() => toggleId("categoryIds", c.id)}
                              className="accent-primary"
                            />
                            {c.name}
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                )}
                {form.scope === "product" && (
                  <div className="space-y-2">
                    <Label>کالاهای مشمول</Label>
                    <div className="max-h-40 overflow-y-auto rounded-md border border-input p-2 space-y-1">
                      {products.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-2 text-center">
                          کالایی موجود نیست.
                        </p>
                      ) : (
                        products.map((p) => (
                          <label
                            key={p.id}
                            className="flex items-center gap-2 text-sm cursor-pointer py-1"
                          >
                            <input
                              type="checkbox"
                              checked={form.productIds.includes(p.id)}
                              onChange={() => toggleId("productIds", p.id)}
                              className="accent-primary"
                            />
                            <span className="truncate">{p.name}</span>
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                )}
                {needsValue && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>
                        {form.type === "percentage"
                          ? "درصد تخفیف"
                          : "مبلغ تخفیف (تومان)"}
                      </Label>
                      <Input
                        type="number"
                        value={form.value}
                        onChange={(e) => set("value", e.target.value)}
                      />
                    </div>
                    {form.type === "percentage" && (
                      <div className="space-y-2">
                        <Label>سقف تخفیف (تومان)</Label>
                        <Input
                          type="number"
                          value={form.maxDiscount}
                          onChange={(e) => set("maxDiscount", e.target.value)}
                          placeholder="اختیاری"
                        />
                      </div>
                    )}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>حداقل خرید (تومان)</Label>
                    <Input
                      type="number"
                      value={form.minPurchase}
                      onChange={(e) => set("minPurchase", e.target.value)}
                      placeholder="اختیاری"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>سقف کل استفاده</Label>
                    <Input
                      type="number"
                      value={form.usageLimit}
                      onChange={(e) => set("usageLimit", e.target.value)}
                      placeholder="نامحدود"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>سقف استفاده هر کاربر</Label>
                    <Input
                      type="number"
                      value={form.perUserLimit}
                      onChange={(e) => set("perUserLimit", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>تاریخ شروع (اختیاری)</Label>
                    <Input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => set("startDate", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>تاریخ پایان (اختیاری)</Label>
                    <Input
                      type="date"
                      value={form.endDate}
                      onChange={(e) => set("endDate", e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleCreate}
                  disabled={
                    createCoupon.isPending ||
                    !form.code ||
                    (needsValue && !form.value) ||
                    !scopeReady
                  }
                >
                  {createCoupon.isPending && (
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  )}
                  ذخیره
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">همه‌ی کدها</CardTitle>
            <CardDescription>
              {coupons.length.toLocaleString("fa-IR")} کد تخفیف
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
                    <TableHead className="text-muted-foreground text-right">کد</TableHead>
                    <TableHead className="text-muted-foreground text-right">نوع</TableHead>
                    <TableHead className="text-muted-foreground text-right">دامنه</TableHead>
                    <TableHead className="text-muted-foreground text-right">مقدار</TableHead>
                    <TableHead className="text-muted-foreground text-right">حداقل خرید</TableHead>
                    <TableHead className="text-muted-foreground text-right">استفاده</TableHead>
                    <TableHead className="text-muted-foreground text-right">وضعیت</TableHead>
                    <TableHead className="text-muted-foreground text-left">عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((c) => (
                    <TableRow key={c.id} className="border-border">
                      <TableCell className="font-medium text-foreground" dir="ltr">
                        {c.code}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {typeLabel[c.type]}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {scopeLabel[c.scope] ?? "کل سبد"}
                        {c.scope === "category" && c.categories?.length
                          ? ` (${c.categories.length.toLocaleString("fa-IR")})`
                          : c.scope === "product" && c.products?.length
                          ? ` (${c.products.length.toLocaleString("fa-IR")})`
                          : ""}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {c.type === "percentage"
                          ? `${c.value}٪`
                          : c.type === "fixed"
                          ? toman(c.value)
                          : "—"}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {c.minPurchase ? toman(c.minPurchase) : "—"}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {(c.usedCount ?? 0).toLocaleString("fa-IR")}
                        {c.usageLimit
                          ? ` / ${c.usageLimit.toLocaleString("fa-IR")}`
                          : ""}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            c.isActive
                              ? "bg-green-500/15 text-green-600 border-green-500/30"
                              : "bg-gray-500/15 text-gray-600"
                          }
                        >
                          {c.isActive ? "فعال" : "غیرفعال"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-left">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm(`حذف کد «${c.code}»؟`))
                              deleteCoupon.mutate(c.id);
                          }}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
