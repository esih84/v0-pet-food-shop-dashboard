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
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from "lucide-react";
import {
  dashboardStats,
  revenueData,
  mockOrders,
  mockProducts,
} from "@/lib/data";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const stats = [
  {
    title: "Total Revenue",
    value: `$${dashboardStats.totalRevenue.toLocaleString()}`,
    change: dashboardStats.revenueChange,
    icon: DollarSign,
  },
  {
    title: "Total Orders",
    value: dashboardStats.totalOrders.toString(),
    change: dashboardStats.ordersChange,
    icon: ShoppingCart,
  },
  {
    title: "Total Products",
    value: dashboardStats.totalProducts.toString(),
    change: dashboardStats.productsChange,
    icon: Package,
  },
  {
    title: "Total Customers",
    value: dashboardStats.totalCustomers.toString(),
    change: dashboardStats.customersChange,
    icon: Users,
  },
];

function getStatusColor(status: string) {
  switch (status) {
    case "delivered":
      return "bg-success/20 text-success border-success/30";
    case "shipped":
      return "bg-info/20 text-info border-info/30";
    case "processing":
      return "bg-warning/20 text-warning border-warning/30";
    case "pending":
      return "bg-muted text-muted-foreground border-muted";
    case "cancelled":
      return "bg-destructive/20 text-destructive border-destructive/30";
    default:
      return "bg-muted text-muted-foreground border-muted";
  }
}

export function DashboardOverview() {
  const recentOrders = mockOrders.slice(0, 5);
  const lowStockProducts = mockProducts.filter((p) =>
    p.variants.some((v) => v.stock < 50)
  );

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
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
              <div className="flex items-center gap-1 text-xs">
                {stat.change > 0 ? (
                  <TrendingUp className="h-3 w-3 text-success" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-destructive" />
                )}
                <span
                  className={
                    stat.change > 0 ? "text-success" : "text-destructive"
                  }
                >
                  {stat.change > 0 ? "+" : ""}
                  {stat.change}%
                </span>
                <span className="text-muted-foreground">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue for the past 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="oklch(0.72 0.18 160)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="oklch(0.72 0.18 160)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(0.28 0.01 250)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    stroke="oklch(0.65 0 0)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="oklch(0.65 0 0)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.18 0.01 250)",
                      border: "1px solid oklch(0.28 0.01 250)",
                      borderRadius: "8px",
                      color: "oklch(0.95 0 0)",
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="oklch(0.72 0.18 160)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-foreground">Recent Orders</CardTitle>
              <CardDescription>Latest customer orders</CardDescription>
            </div>
            <Link href="/orders">
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 p-3"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {order.orderNumber}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.customer}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      ${order.total.toFixed(2)}
                    </p>
                    <Badge
                      variant="outline"
                      className={`text-xs capitalize ${getStatusColor(order.status)}`}
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-foreground">Low Stock Alert</CardTitle>
              <CardDescription>
                Products with variants below 50 units
              </CardDescription>
            </div>
            <Link href="/products">
              <Button variant="ghost" size="sm" className="gap-1">
                Manage Stock <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-secondary/50 p-3"
                >
                  <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                    <Package className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {product.name}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {product.variants
                        .filter((v) => v.stock < 50)
                        .map((v) => (
                          <Badge
                            key={v.id}
                            variant="outline"
                            className="text-xs bg-warning/20 text-warning border-warning/30"
                          >
                            {v.size}: {v.stock} left
                          </Badge>
                        ))}
                    </div>
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
