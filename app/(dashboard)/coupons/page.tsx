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
import { Plus, Trash2, Loader2 } from "lucide-react";
import { useCoupons } from "@/features/coupon/queries";
import { useCreateCoupon, useDeleteCoupon } from "@/features/coupon/mutations";
import type { CouponType } from "@/features/coupon/coupon-api";

const toman = (v: number) => `${Math.round(v).toLocaleString("fa-IR")} تومان`;

export default function CouponsPage() {
  const { data: response, isLoading } = useCoupons();
  const coupons = response?.data ?? [];
  const createCoupon = useCreateCoupon();
  const deleteCoupon = useDeleteCoupon();

  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [type, setType] = useState<CouponType>("percentage");
  const [value, setValue] = useState("");
  const [minPurchase, setMinPurchase] = useState("");

  const handleCreate = async () => {
    if (!code || !value) return;
    await createCoupon.mutateAsync({
      code: code.toUpperCase(),
      type,
      value: Number(value),
      minPurchase: minPurchase ? Number(minPurchase) : undefined,
      isActive: true,
    });
    setCode("");
    setValue("");
    setMinPurchase("");
    setType("percentage");
    setOpen(false);
  };

  return (
    <div className="flex flex-col" dir="rtl">
      <Header title="کدهای تخفیف" description="مدیریت کوپن‌های تخفیف." />
      <div className="flex-1 p-6 space-y-6">
        <div className="flex justify-end">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> کد تخفیف جدید
              </Button>
            </DialogTrigger>
            <DialogContent dir="rtl">
              <DialogHeader>
                <DialogTitle>افزودن کد تخفیف</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>کد</Label>
                  <Input dir="ltr" value={code} onChange={(e) => setCode(e.target.value)} placeholder="WELCOME10" />
                </div>
                <div className="space-y-2">
                  <Label>نوع</Label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as CouponType)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="percentage">درصدی</option>
                    <option value="fixed">مبلغ ثابت</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>{type === "percentage" ? "درصد تخفیف" : "مبلغ تخفیف (تومان)"}</Label>
                  <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>حداقل خرید (اختیاری)</Label>
                  <Input type="number" value={minPurchase} onChange={(e) => setMinPurchase(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreate} disabled={createCoupon.isPending || !code || !value}>
                  {createCoupon.isPending && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
                  ذخیره
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">همه‌ی کدها</CardTitle>
            <CardDescription>{coupons.length.toLocaleString("fa-IR")} کد تخفیف</CardDescription>
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
                    <TableHead className="text-muted-foreground text-right">مقدار</TableHead>
                    <TableHead className="text-muted-foreground text-right">حداقل خرید</TableHead>
                    <TableHead className="text-muted-foreground text-right">وضعیت</TableHead>
                    <TableHead className="text-muted-foreground text-left">عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((c) => (
                    <TableRow key={c.id} className="border-border">
                      <TableCell className="font-medium text-foreground" dir="ltr">{c.code}</TableCell>
                      <TableCell className="text-foreground">
                        {c.type === "percentage" ? `${c.value}٪` : toman(c.value)}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {c.minPurchase ? toman(c.minPurchase) : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={c.isActive ? "bg-green-500/15 text-green-600 border-green-500/30" : "bg-gray-500/15 text-gray-600"}
                        >
                          {c.isActive ? "فعال" : "غیرفعال"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-left">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm(`حذف کد «${c.code}»؟`)) deleteCoupon.mutate(c.id);
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
