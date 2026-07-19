"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/dashboard/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  ArrowLeft,
  Loader2,
  Phone,
  Mail,
  Calendar,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import { useCustomer } from "@/features/customer/queries";
import { useUserOrders } from "@/features/order/queries";
import type { OrderStatus } from "@/features/order/order-api";

const toman = (v: number) => `${Math.round(v).toLocaleString("fa-IR")} تومان`;

const STATUS: Record<OrderStatus, { label: string; className: string }> = {
  pending: {
    label: "در انتظار",
    className: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  },
  confirmed: {
    label: "تأییدشده",
    className: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  },
  processing: {
    label: "در حال پردازش",
    className: "bg-blue-400/15 text-blue-500 border-blue-400/30",
  },
  shipped: {
    label: "ارسال‌شده",
    className: "bg-indigo-500/15 text-indigo-600 border-indigo-500/30",
  },
  delivered: {
    label: "تحویل‌شده",
    className: "bg-green-500/15 text-green-600 border-green-500/30",
  },
  cancelled: {
    label: "لغوشده",
    className: "bg-red-500/15 text-red-600 border-red-500/30",
  },
  refunded: {
    label: "مرجوع‌شده",
    className: "bg-gray-500/15 text-gray-600 border-gray-500/30",
  },
};

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data: customer, isLoading: customerLoading } = useCustomer(id);
  const { data: ordersRes, isLoading: ordersLoading } = useUserOrders(id);
  const orders = ordersRes?.data ?? [];

  const fullName =
    `${customer?.firstName ?? ""} ${customer?.lastName ?? ""}`.trim() ||
    "بدون نام";
  const totalSpent = orders.reduce((sum, o) => sum + Number(o.finalAmount), 0);

  return (
    <div className="flex flex-col" dir="rtl">
      <Header
        title="جزئیات مشتری"
        description="اطلاعات کاربر و تاریخچه‌ی سفارش‌ها."
      />
      <div className="flex-1 p-6 space-y-6">
        <Link href="/customers">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> بازگشت به مشتریان
          </Button>
        </Link>

        {customerLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !customer ? (
          <p className="text-center text-muted-foreground py-12 text-sm">
            مشتری یافت نشد.
          </p>
        ) : (
          <>
            {/* اطلاعات کاربر */}
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
                      {fullName.charAt(0)}
                    </div>
                    <div>
                      <CardTitle className="text-foreground">
                        {fullName}
                      </CardTitle>
                      <CardDescription>
                        عضو از{" "}
                        {new Date(customer.createdAt).toLocaleDateString(
                          "fa-IR",
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      customer.role === "admin"
                        ? "bg-primary/15 text-primary border-primary/30"
                        : ""
                    }
                  >
                    {customer.role === "admin" ? "ادمین" : "کاربر"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">موبایل</p>
                      <p className="font-medium text-foreground" dir="ltr">
                        {customer.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">ایمیل</p>
                      <p className="font-medium text-foreground">
                        {customer.email || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        تاریخ تولد
                      </p>
                      <p className="font-medium text-foreground">
                        {customer.birthDate
                          ? new Date(customer.birthDate).toLocaleDateString(
                              "fa-IR",
                            )
                          : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        تعداد سفارش‌ها
                      </p>
                      <p className="font-medium text-foreground">
                        {orders.length.toLocaleString("fa-IR")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        مجموع خرید
                      </p>
                      <p className="font-medium text-foreground">
                        {toman(totalSpent)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* تاریخچه‌ی سفارش‌ها */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">
                  تاریخچه‌ی سفارش‌ها
                </CardTitle>
                <CardDescription>
                  {orders.length.toLocaleString("fa-IR")} سفارش
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : orders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8 text-sm">
                    این مشتری هنوز سفارشی ثبت نکرده است.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-muted-foreground text-right">
                          شماره سفارش
                        </TableHead>
                        <TableHead className="text-muted-foreground text-right">
                          اقلام
                        </TableHead>
                        <TableHead className="text-muted-foreground text-right">
                          مبلغ
                        </TableHead>
                        <TableHead className="text-muted-foreground text-right">
                          تاریخ
                        </TableHead>
                        <TableHead className="text-muted-foreground text-right">
                          وضعیت
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((o) => (
                        <TableRow key={o.id} className="border-border">
                          <TableCell
                            className="font-medium text-foreground"
                            dir="ltr"
                          >
                            {o.orderNumber ?? `#${o.id.slice(0, 8)}`}
                          </TableCell>
                          <TableCell className="text-foreground">
                            {(o.items?.length ?? 0).toLocaleString("fa-IR")} قلم
                          </TableCell>
                          <TableCell className="text-foreground font-semibold">
                            {toman(o.finalAmount)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(o.createdAt).toLocaleDateString("fa-IR")}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={STATUS[o.status]?.className}
                            >
                              {STATUS[o.status]?.label ?? o.status}
                            </Badge>
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
