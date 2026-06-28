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
import { Search, Loader2 } from "lucide-react";
import { useCustomers } from "@/features/customer/queries";

export default function CustomersPage() {
  const { data: response, isLoading } = useCustomers();
  const customers = response?.data ?? [];
  const [query, setQuery] = useState("");

  const filtered = customers.filter((c) => {
    const q = query.toLowerCase();
    return (
      c.phone.includes(q) ||
      `${c.firstName ?? ""} ${c.lastName ?? ""}`.toLowerCase().includes(q) ||
      (c.email ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col" dir="rtl">
      <Header title="مشتریان" description="فهرست کاربران ثبت‌نام‌شده." />
      <div className="flex-1 p-6 space-y-6">
        <div className="relative max-w-sm">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="جستجوی مشتری..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pr-9 bg-input"
          />
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">همه‌ی مشتریان</CardTitle>
            <CardDescription>{filtered.length.toLocaleString("fa-IR")} مشتری</CardDescription>
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
                    <TableHead className="text-muted-foreground text-right">نام</TableHead>
                    <TableHead className="text-muted-foreground text-right">موبایل</TableHead>
                    <TableHead className="text-muted-foreground text-right">ایمیل</TableHead>
                    <TableHead className="text-muted-foreground text-right">نقش</TableHead>
                    <TableHead className="text-muted-foreground text-right">تاریخ عضویت</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => (
                    <TableRow key={c.id} className="border-border">
                      <TableCell className="font-medium text-foreground">
                        {`${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() || "—"}
                      </TableCell>
                      <TableCell className="text-foreground">{c.phone}</TableCell>
                      <TableCell className="text-foreground">{c.email ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={c.role === "admin" ? "bg-primary/15 text-primary border-primary/30" : ""}>
                          {c.role === "admin" ? "ادمین" : "کاربر"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-foreground">
                        {new Date(c.createdAt).toLocaleDateString("fa-IR")}
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
