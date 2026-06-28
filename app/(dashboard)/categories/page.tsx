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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, Loader2, FolderTree } from "lucide-react";
import { useCategories } from "@/features/category/queries";
import {
  useCreateCategory,
  useDeleteCategory,
} from "@/features/category/mutations";
import type { Category } from "@/features/category/category-api";

function slugify(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^\w؀-ۿ-]/g, "");
}

export default function CategoriesPage() {
  const { data: categories = [], isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState<string>("");

  const flat: Category[] = [];
  const walk = (list: Category[], depth = 0) => {
    for (const c of list) {
      flat.push({ ...c, name: `${"— ".repeat(depth)}${c.name}` });
      if (c.children?.length) walk(c.children, depth + 1);
    }
  };
  walk(categories);

  const handleCreate = async () => {
    if (!name) return;
    await createCategory.mutateAsync({
      name,
      slug: slug || slugify(name),
      parentId: parentId || undefined,
    });
    setName("");
    setSlug("");
    setParentId("");
    setOpen(false);
  };

  return (
    <div className="flex flex-col" dir="rtl">
      <Header title="دسته‌بندی‌ها" description="مدیریت دسته‌بندی محصولات." />
      <div className="flex-1 p-6 space-y-6">
        <div className="flex justify-end">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> دسته‌بندی جدید
              </Button>
            </DialogTrigger>
            <DialogContent dir="rtl">
              <DialogHeader>
                <DialogTitle>افزودن دسته‌بندی</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>نام</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: غذای سگ" />
                </div>
                <div className="space-y-2">
                  <Label>اسلاگ (اختیاری)</Label>
                  <Input dir="ltr" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="dog-food" />
                </div>
                <div className="space-y-2">
                  <Label>دسته‌ی والد (اختیاری)</Label>
                  <select
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">— بدون والد —</option>
                    {flat.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreate} disabled={createCategory.isPending || !name}>
                  {createCategory.isPending && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
                  ذخیره
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">فهرست دسته‌بندی‌ها</CardTitle>
            <CardDescription>{flat.length.toLocaleString("fa-IR")} دسته</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : flat.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">هنوز دسته‌بندی‌ای ثبت نشده است.</p>
            ) : (
              <div className="space-y-2">
                {flat.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                        <FolderTree className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{c.name}</p>
                        <p className="text-xs text-muted-foreground" dir="ltr">{c.slug}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm(`حذف دسته‌ی «${c.name.trim()}»؟`)) deleteCategory.mutate(c.id);
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
