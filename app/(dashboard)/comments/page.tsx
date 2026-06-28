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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Star, Check, Trash2, Loader2 } from "lucide-react";
import { useComments } from "@/features/review/queries";
import { useApproveReview, useDeleteReview } from "@/features/review/mutations";

export default function CommentsPage() {
  const { data: reviews = [], isLoading } = useComments();
  const approve = useApproveReview();
  const remove = useDeleteReview();
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  const filtered = reviews.filter((r) =>
    filter === "all"
      ? true
      : filter === "approved"
        ? r.isApproved
        : !r.isApproved,
  );

  const userName = (r: { user?: { firstName?: string; lastName?: string; phone?: string } }) =>
    `${r.user?.firstName ?? ""} ${r.user?.lastName ?? ""}`.trim() || r.user?.phone || "—";

  return (
    <div className="flex flex-col" dir="rtl">
      <Header title="نظرات" description="بررسی و تأیید نظرات محصولات." />
      <div className="flex-1 p-6 space-y-6">
        <div className="flex gap-2">
          {([
            ["all", "همه"],
            ["pending", "در انتظار تأیید"],
            ["approved", "تأییدشده"],
          ] as const).map(([val, label]) => (
            <Button
              key={val}
              variant={filter === val ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(val)}
            >
              {label}
            </Button>
          ))}
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">نظرات</CardTitle>
            <CardDescription>{filtered.length.toLocaleString("fa-IR")} نظر</CardDescription>
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
                    <TableHead className="text-muted-foreground text-right">کاربر</TableHead>
                    <TableHead className="text-muted-foreground text-right">محصول</TableHead>
                    <TableHead className="text-muted-foreground text-right">امتیاز</TableHead>
                    <TableHead className="text-muted-foreground text-right">متن</TableHead>
                    <TableHead className="text-muted-foreground text-right">وضعیت</TableHead>
                    <TableHead className="text-muted-foreground text-left">عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => (
                    <TableRow key={r.id} className="border-border">
                      <TableCell className="text-foreground">{userName(r)}</TableCell>
                      <TableCell className="text-foreground">{r.product?.name ?? "—"}</TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1 text-amber-500">
                          {r.rating}
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        </span>
                      </TableCell>
                      <TableCell className="text-foreground max-w-xs truncate">
                        {r.comment ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            r.isApproved
                              ? "bg-green-500/15 text-green-600 border-green-500/30"
                              : "bg-amber-500/15 text-amber-600 border-amber-500/30"
                          }
                        >
                          {r.isApproved ? "تأییدشده" : "در انتظار"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-left">
                        <div className="flex items-center justify-end gap-1">
                          {!r.isApproved && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => approve.mutate(r.id)}
                              disabled={approve.isPending}
                              className="text-green-600 hover:text-green-600"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm("حذف این نظر؟")) remove.mutate(r.id);
                            }}
                            disabled={remove.isPending}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
