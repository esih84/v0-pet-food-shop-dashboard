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
  Search,
  Eye,
  MapPin,
  Package,
  Loader2,
  PawPrint,
  Truck,
} from "lucide-react";
import { useOrders } from "@/features/order/queries";
import { useUpdateOrderStatus } from "@/features/order/mutations";
import {
  SHIPPING_METHOD_LABELS,
  type OrderStatus,
} from "@/features/order/order-api";
import { DataPagination } from "@/components/dashboard/data-pagination";
import { PAGE_SIZE } from "@/lib/pagination";

const STATUS: { value: OrderStatus; label: string; className: string }[] = [
  {
    value: "pending",
    label: "در انتظار",
    className: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  },
  {
    value: "confirmed",
    label: "تأییدشده",
    className: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  },
  {
    value: "processing",
    label: "در حال پردازش",
    className: "bg-blue-400/15 text-blue-500 border-blue-400/30",
  },
  {
    value: "shipped",
    label: "ارسال‌شده",
    className: "bg-indigo-500/15 text-indigo-600 border-indigo-500/30",
  },
  {
    value: "delivered",
    label: "تحویل‌شده",
    className: "bg-green-500/15 text-green-600 border-green-500/30",
  },
  {
    value: "cancelled",
    label: "لغوشده",
    className: "bg-red-500/15 text-red-600 border-red-500/30",
  },
  {
    value: "refunded",
    label: "مرجوع‌شده",
    className: "bg-gray-500/15 text-gray-600 border-gray-500/30",
  },
];

const toman = (v: number) => `${Math.round(v).toLocaleString("fa-IR")} تومان`;
const statusMeta = (s: string) => STATUS.find((x) => x.value === s);
const customerName = (o: {
  shippingAddress?: { firstName?: string; lastName?: string };
  user?: { firstName?: string; lastName?: string; phone?: string };
}) => {
  const a = o.shippingAddress;
  if (a?.firstName || a?.lastName)
    return `${a.firstName ?? ""} ${a.lastName ?? ""}`.trim();
  if (o.user?.firstName || o.user?.lastName)
    return `${o.user.firstName ?? ""} ${o.user.lastName ?? ""}`.trim();
  return o.user?.phone ?? "—";
};

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const { data: response, isLoading } = useOrders(page, PAGE_SIZE);
  const orders = response?.data ?? [];
  const updateStatus = useUpdateOrderStatus();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const selectedOrder = orders.find((o) => o.id === selectedId);

  const filtered = orders.filter((order) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      order.id.toLowerCase().includes(q) ||
      (order.orderNumber ?? "").toLowerCase().includes(q) ||
      customerName(order).toLowerCase().includes(q) ||
      (order.user?.phone ?? "").includes(q);
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col" dir="rtl">
      <Header
        title="سفارش‌ها"
        description="پیگیری و مدیریت سفارش‌های مشتریان."
      />
      <div className="flex-1 p-6 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="جستجو در این صفحه..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-9 bg-input"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-42.5 bg-input">
              <SelectValue placeholder="وضعیت" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه‌ی وضعیت‌ها</SelectItem>
              {STATUS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">همه‌ی سفارش‌ها</CardTitle>
            <CardDescription>
              {(response?.total ?? 0).toLocaleString("fa-IR")} سفارش
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
                      شماره سفارش
                    </TableHead>
                    <TableHead className="text-muted-foreground text-right">
                      مشتری
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
                    <TableHead className="text-muted-foreground text-left">
                      عملیات
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((order) => (
                    <TableRow key={order.id} className="border-border">
                      <TableCell className="font-medium text-foreground">
                        {order.orderNumber ?? `#${order.id.slice(0, 8)}`}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {customerName(order)}
                      </TableCell>
                      <TableCell className="text-foreground font-semibold">
                        {toman(order.finalAmount)}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {new Date(order.createdAt).toLocaleDateString("fa-IR")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={statusMeta(order.status)?.className}
                        >
                          {statusMeta(order.status)?.label ?? order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-left">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedId(order.id);
                            setIsDetailOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
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

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent
          className="max-w-2xl max-h-[90vh] overflow-y-auto"
          dir="rtl"
        >
          <DialogHeader>
            <DialogTitle>جزئیات سفارش</DialogTitle>
            <DialogDescription dir="ltr">
              {selectedOrder?.orderNumber ??
                (selectedOrder ? `#${selectedOrder.id.slice(0, 8)}` : "")}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6 py-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">تغییر وضعیت</h4>
                <div className="flex flex-wrap gap-2">
                  {STATUS.map((opt) => (
                    <Button
                      key={opt.value}
                      variant={
                        selectedOrder.status === opt.value
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        updateStatus.mutate({
                          id: selectedOrder.id,
                          status: opt.value,
                        })
                      }
                      disabled={updateStatus.isPending}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 border-t border-border pt-4">
                <h4 className="font-semibold text-foreground">
                  اطلاعات گیرنده
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">نام</p>
                    <p className="font-medium text-foreground">
                      {customerName(selectedOrder)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">موبایل</p>
                    <p className="font-medium text-foreground">
                      {selectedOrder.user?.phone ?? "—"}
                    </p>
                  </div>
                  {selectedOrder.shippingAddress?.petName && (
                    <div className="flex items-center gap-2">
                      <PawPrint className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-muted-foreground">نام حیوان</p>
                        <p className="font-medium text-foreground">
                          {selectedOrder.shippingAddress.petName}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedOrder.shippingAddress && (
                <div className="space-y-2 border-t border-border pt-4">
                  <h4 className="font-semibold text-foreground">آدرس تحویل</h4>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                    <p className="text-foreground">
                      {[
                        selectedOrder.shippingAddress.city,
                        selectedOrder.shippingAddress.address,
                        selectedOrder.shippingAddress.plaque &&
                          `پلاک ${selectedOrder.shippingAddress.plaque}`,
                      ]
                        .filter(Boolean)
                        .join("، ")}
                    </p>
                  </div>
                </div>
              )}

              {selectedOrder.shippingMethod && (
                <div className="space-y-2 border-t border-border pt-4">
                  <h4 className="font-semibold text-foreground">روش ارسال</h4>
                  <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-muted-foreground" />
                    <p className="text-foreground">
                      {SHIPPING_METHOD_LABELS[selectedOrder.shippingMethod] ??
                        selectedOrder.shippingMethod}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-3 border-t border-border pt-4">
                <h4 className="font-semibold text-foreground">اقلام سفارش</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {item.productName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            تعداد: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-foreground">
                        {toman(item.totalPrice)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-4 space-y-1 text-sm">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>جمع کل</span>
                  <span>{toman(selectedOrder.totalAmount)}</span>
                </div>
                {selectedOrder.discountAmount > 0 && (
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>تخفیف</span>
                    <span>−{toman(selectedOrder.discountAmount)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-lg font-semibold text-foreground">
                    مبلغ نهایی
                  </span>
                  <span className="text-2xl font-bold text-primary">
                    {toman(selectedOrder.finalAmount)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              بستن
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
