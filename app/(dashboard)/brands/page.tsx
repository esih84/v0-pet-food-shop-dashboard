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
import { Plus, Trash2, Loader2, Tag, Pencil } from "lucide-react";
import { useBrands } from "@/features/brand/queries";
import {
  useCreateBrand,
  useUpdateBrand,
  useDeleteBrand,
} from "@/features/brand/mutations";
import type { Brand } from "@/features/brand/brand-api";

function slugify(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^\w؀-ۿ-]/g, "");
}

export default function BrandsPage() {
  const { data: brands = [], isLoading } = useBrands();
  const createBrand = useCreateBrand();
  const updateBrand = useUpdateBrand();
  const deleteBrand = useDeleteBrand();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("");

  const isSaving = createBrand.isPending || updateBrand.isPending;

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setSlugTouched(false);
    setImageFile(null);
    setCurrentImageUrl("");
  };

  const openCreate = () => {
    resetForm();
    setOpen(true);
  };

  const openEdit = (b: Brand) => {
    setEditingId(b.id);
    setName(b.name);
    setSlug(b.slug);
    setSlugTouched(true);
    setImageFile(null);
    setCurrentImageUrl(b.imageUrl ?? "");
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!name) return;
    const payload = {
      name,
      slug: slug || slugify(name),
      image: imageFile ?? undefined,
    };
    if (editingId) {
      await updateBrand.mutateAsync({ id: editingId, data: payload });
    } else {
      await createBrand.mutateAsync(payload);
    }
    setOpen(false);
    resetForm();
  };

  return (
    <div className="flex flex-col" dir="rtl">
      <Header title="برندها" description="مدیریت برندهای محصولات." />
      <div className="flex-1 p-6 space-y-6">
        <div className="flex justify-end">
          <Button className="gap-2" onClick={openCreate}>
            <Plus className="h-4 w-4" /> برند جدید
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
                  {editingId ? "ویرایش برند" : "افزودن برند"}
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
                    placeholder="مثال: رویال کنین"
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
                    placeholder="royal-canin"
                  />
                </div>
                <div className="space-y-2">
                  <Label>لوگو / تصویر برند</Label>
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
            <CardTitle className="text-foreground">فهرست برندها</CardTitle>
            <CardDescription>
              {brands.length.toLocaleString("fa-IR")} برند
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : brands.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                هنوز برندی ثبت نشده است.
              </p>
            ) : (
              <div className="space-y-2">
                {brands.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                        {b.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={b.imageUrl}
                            alt={b.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Tag className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{b.name}</p>
                        <p className="text-xs text-muted-foreground" dir="ltr">
                          {b.slug}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(b)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm(`حذف برند «${b.name}»؟`))
                            deleteBrand.mutate(b.id);
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
