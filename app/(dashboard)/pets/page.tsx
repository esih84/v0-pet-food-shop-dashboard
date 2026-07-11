"use client";

import { useState } from "react";
import Link from "next/link";
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
import { Search, Loader2, PawPrint } from "lucide-react";
import { usePets } from "@/features/pet/queries";
import type { PetType } from "@/features/pet/pet-api";
import { DataPagination } from "@/components/dashboard/data-pagination";
import { PAGE_SIZE } from "@/lib/pagination";

const typeLabel: Record<PetType, string> = {
  dog: "سگ",
  cat: "گربه",
  bird: "پرنده",
  other: "سایر",
};

const ownerName = (u?: { firstName?: string; lastName?: string; phone: string }) => {
  if (!u) return "—";
  return `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.phone;
};

export default function PetsPage() {
  const [page, setPage] = useState(1);
  const { data: response, isLoading } = usePets(page, PAGE_SIZE);
  const pets = response?.data ?? [];
  const [query, setQuery] = useState("");

  const filtered = pets.filter((p) => {
    const q = query.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.breed ?? "").toLowerCase().includes(q) ||
      ownerName(p.user).toLowerCase().includes(q) ||
      (p.user?.phone ?? "").includes(q)
    );
  });

  return (
    <div className="flex flex-col" dir="rtl">
      <Header
        title="حیوانات خانگی"
        description="فهرست حیوانات خانگی ثبت‌شده‌ی مشتریان."
      />
      <div className="flex-1 p-6 space-y-6">
        <div className="relative max-w-sm">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="جستجو در این صفحه (نام حیوان یا صاحب)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pr-9 bg-input"
          />
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">همه‌ی حیوانات خانگی</CardTitle>
            <CardDescription>
              {(response?.total ?? 0).toLocaleString("fa-IR")} حیوان خانگی
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">
                حیوان خانگی‌ای یافت نشد.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground text-right">
                      نام
                    </TableHead>
                    <TableHead className="text-muted-foreground text-right">
                      نوع
                    </TableHead>
                    <TableHead className="text-muted-foreground text-right">
                      نژاد
                    </TableHead>
                    <TableHead className="text-muted-foreground text-right">
                      صاحب
                    </TableHead>
                    <TableHead className="text-muted-foreground text-right">
                      تاریخ ثبت
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => (
                    <TableRow key={p.id} className="border-border">
                      <TableCell className="font-medium text-foreground">
                        <span className="flex items-center gap-2">
                          <PawPrint className="h-4 w-4 text-primary" />
                          {p.name}
                        </span>
                      </TableCell>
                      <TableCell>
                        {p.type ? (
                          <Badge variant="outline">{typeLabel[p.type]}</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {p.breed || "—"}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {p.userId ? (
                          <Link
                            href={`/customers/${p.userId}`}
                            className="hover:text-primary hover:underline"
                          >
                            {ownerName(p.user)}
                          </Link>
                        ) : (
                          ownerName(p.user)
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(p.createdAt).toLocaleDateString("fa-IR")}
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
