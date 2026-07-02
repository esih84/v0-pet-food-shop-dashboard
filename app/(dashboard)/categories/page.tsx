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
} from "@/components/ui/dialog";
import { Plus, Trash2, Loader2, FolderTree, Pencil } from "lucide-react";
import { useCategories } from "@/features/category/queries";
import {
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/features/category/mutations";
import type { Category } from "@/features/category/category-api";

function slugify(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^\w؀-ۿ-]/g, "");
}

export default function CategoriesPage() {
  const { data: categories = [], isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [parentId, setParentId] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("");

  const flat: (Category & { depth: number })[] = [];
  const walk = (list: Category[], depth = 0) => {
    for (const c of list) {
      flat.push({ ...c, depth });
      if (c.children?.length) walk(c.children, depth + 1);
    }
  };
  walk(categories);

  const isSaving = createCategory.isPending || updateCategory.isPending;

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setSlugTouched(false);
    setParentId("");
    setImageFile(null);
    setCurrentImageUrl("");
  };

  const openCreate = () => {
    resetForm();
    setOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditingId(c.id);
    setName(c.name);
    setSlug(c.slug);
    setSlugTouched(true);
    setParentId(c.parentId ?? "");
    setImageFile(null);
    setCurrentImageUrl(c.imageUrl ?? "");
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!name) return;
    const payload = {
      name,
      slug: slug || slugify(name),
      parentId: parentId || undefined,
      image: imageFile ?? undefined,
    };
    if (editingId) {
      await updateCategory.mutateAsync({ id: editingId, data: payload });
    } else {
      await createCategory.mutateAsync(payload);
    }
    setOpen(false);
    resetForm();
  };

  return (
    <div className="flex flex-col" dir="rtl">
      <Header title="دسته‌بندی‌ها" description="مدیریت دسته‌بندی محصولات." />
      <div className="flex-1 p-6 space-y-6">
        <div className="flex justify-end">
          <Button className="gap-2" onClick={openCreate}>
            <Plus className="h-4 w-4" /> دسته‌بندی جدید
          </Button>
          <Dialog
            open={open}
            onOpenChange={(o) => {
              setOpen(o);
              if (!o) resetForm();
            }}
          >
            <DialogContent dir="rtl">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "ویرایش دسته‌بندی" : "افزودن دسته‌بندی"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>نام</Label>
                  <Input
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!slugTouched) setSlug(slugify(e.target.value));
                    }}
                    placeholder="مثال: غذای سگ"
                  />
                </div>
                <div className="space-y-2">
                  <Label>اسلاگ</Label>
                  <Input
                    dir="ltr"
                    value={slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      setSlug(e.target.value);
                    }}
                    placeholder="dog-food"
                  />
                </div>
                <div className="space-y-2">
                  <Label>دسته‌ی والد (اختیاری)</Label>
                  <select
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">— بدون والد —</option>
                    {flat
                      .filter((c) => c.id !== editingId)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {"— ".repeat(c.depth)}
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>تصویر دسته‌بندی</Label>
                  {(imageFile || currentImageUrl) && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={
                        imageFile
                          ? URL.createObjectURL(imageFile)
                          : currentImageUrl
                      }
                      alt="پیش‌نمایش"
                      className="h-24 w-24 rounded-lg border border-border object-cover"
                    />
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                  />
                  {imageFile && (
                    <p className="text-xs text-muted-foreground">
                      انتخاب‌شده: {imageFile.name}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSubmit} disabled={isSaving || !name}>
                  {isSaving && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
                  {editingId ? "به‌روزرسانی" : "ذخیره"}
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
                    style={{ marginRight: c.depth * 24 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                        {c.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={c.imageUrl}
                            alt={c.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <FolderTree className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{c.name}</p>
                        <p className="text-xs text-muted-foreground" dir="ltr">{c.slug}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(c)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm(`حذف دسته‌ی «${c.name}»؟`)) deleteCategory.mutate(c.id);
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
