"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  ArrowRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useOrders } from "@/features/order/queries";
import { useCustomers } from "@/features/customer/queries";
import { useProducts } from "@/features/product/queries";

const toman = (v: number) => `${Math.round(v).toLocaleString("fa-IR")} تومان`;

const STATUS_FA: Record<string, { label: string; className: string }> = {
  pending: { label: "در انتظار", className: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
  confirmed: { label: "تأییدشده", className: "bg-blue-500/15 text-blue-600 border-blue-500/30" },
  processing: { label: "در حال پردازش", className: "bg-blue-400/15 text-blue-500 border-blue-400/30" },
  shipped: { label: "ارسال‌شده", className: "bg-indigo-500/15 text-indigo-600 border-indigo-500/30" },
  delivered: { label: "تحویل‌شده", className: "bg-green-500/15 text-green-600 border-green-500/30" },
  cancelled: { label: "لغوشده", className: "bg-red-500/15 text-red-600 border-red-500/30" },
  refunded: { label: "مرجوع‌شده", className: "bg-gray-500/15 text-gray-600 border-gray-500/30" },
};

export function DashboardOverview() {
  const { data: ordersRes, isLoading: ordersLoading } = useOrders(1, 100);
  const { data: customersRes } = useCustomers(1, 1);
  const { data: productsRes } = useProducts();

  const orders = ordersRes?.data ?? [];
  const revenue = orders
    .filter((o) => o.status !== "cancelled" && o.status !== "refunded")
    .reduce((sum, o) => sum + Number(o.finalAmount), 0);

  const products = productsRes?.data ?? [];
  const lowStock = products.filter((p) => (p.stock ?? 0) < 10);

  const stats = [
    { title: "درآمد کل", value: toman(revenue), icon: DollarSign },
    { title: "تعداد سفارش‌ها", value: (ordersRes?.total ?? 0).toLocaleString("fa-IR"), icon: ShoppingCart },
    { title: "تعداد محصولات", value: (productsRes?.total ?? 0).toLocaleString("fa-IR"), icon: Package },
    { title: "تعداد مشتریان", value: (customersRes?.total ?? 0).toLocaleString("fa-IR"), icon: Users },
  ];

  const recentOrders = orders.slice(0, 5);
  const customerName = (o: {
    shippingAddress?: { firstName?: string; lastName?: string };
    user?: { phone?: string };
  }) =>
    `${o.shippingAddress?.firstName ?? ""} ${o.shippingAddress?.lastName ?? ""}`.trim() ||
    o.user?.phone ||
    "—";

  return (
    <div className="space-y-6" dir="rtl">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-foreground">سفارش‌های اخیر</CardTitle>
            <CardDescription>آخرین سفارش‌های مشتریان</CardDescription>
          </div>
          <Link href="/orders">
            <Button variant="ghost" size="sm" className="gap-1">
              مشاهده همه <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : recentOrders.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">سفارشی ثبت نشده است.</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 p-3"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground" dir="ltr">
                      {order.orderNumber ?? `#${order.id.slice(0, 8)}`}
                    </p>
                    <p className="text-xs text-muted-foreground">{customerName(order)}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">{toman(order.finalAmount)}</p>
                    <Badge variant="outline" className={`text-xs ${STATUS_FA[order.status]?.className ?? ""}`}>
                      {STATUS_FA[order.status]?.label ?? order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {lowStock.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-foreground">هشدار موجودی کم</CardTitle>
              <CardDescription>محصولات با موجودی کمتر از ۱۰ عدد</CardDescription>
            </div>
            <Link href="/products">
              <Button variant="ghost" size="sm" className="gap-1">
                مدیریت محصولات <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {lowStock.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-secondary/50 p-3"
                >
                  <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                    <Package className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                    <Badge
                      variant="outline"
                      className="text-xs mt-1 bg-amber-500/15 text-amber-600 border-amber-500/30"
                    >
                      {(product.stock ?? 0).toLocaleString("fa-IR")} عدد باقی‌مانده
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
