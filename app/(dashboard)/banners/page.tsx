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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BANNER_POSITION_OPTIONS,
  bannerPositionLabel,
} from "@/lib/types/banner";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { useAdminBanners } from "@/features/banner/queries";
import {
  useCreateBanner,
  useUpdateBanner,
  useDeleteBanner,
} from "@/features/banner/mutations";
import { DataPagination } from "@/components/dashboard/data-pagination";
import { PAGE_SIZE } from "@/lib/pagination";

export default function BannersPage() {
  const [page, setPage] = useState(1);
  const { data: response, isLoading } = useAdminBanners(page, PAGE_SIZE);
  const banners = response?.data ?? [];
  const createMutation = useCreateBanner();
  const updateMutation = useUpdateBanner();
  const deleteMutation = useDeleteBanner();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);

  const emptyForm = {
    title: "",
    description: "",
    imageUrl: "",
    link: "",
    position: "home_main",
    order: 1,
    isActive: true,
  };
  const [formData, setFormData] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [mobileImageFile, setMobileImageFile] = useState<File | null>(null);

  const editingBanner = banners.find((b) => b.id === editingBannerId);

  const resetForm = () => {
    setFormData({ ...emptyForm, order: banners.length + 1 });
    setImageFile(null);
    setMobileImageFile(null);
    setEditingBannerId(null);
  };

  const openEditDialog = (bannerId: string) => {
    setEditingBannerId(bannerId);
    const banner = banners.find((b) => b.id === bannerId);
    if (banner) {
      setFormData({
        title: banner.title || "",
        description: banner.description || "",
        imageUrl: banner.imageUrl || "",
        link: banner.link || "",
        position: banner.position || "home_main",
        order: banner.order || 1,
        isActive: banner.isActive ?? true,
      });
      setImageFile(null);
      setMobileImageFile(null);
      setIsDialogOpen(true);
    }
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        title: formData.title,
        description: formData.description || undefined,
        imageUrl: formData.imageUrl || undefined,
        link: formData.link || undefined,
        position: formData.position || undefined,
        order: formData.order,
        isActive: formData.isActive,
        image: imageFile ?? undefined,
        mobileImage: mobileImageFile ?? undefined,
      };
      if (editingBannerId) {
        await updateMutation.mutateAsync({ id: editingBannerId, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to save banner:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("حذف این بنر؟")) await deleteMutation.mutateAsync(id);
  };

  const toggleActive = async (bannerId: string) => {
    const banner = banners.find((b) => b.id === bannerId);
    if (!banner) return;
    await updateMutation.mutateAsync({
      id: bannerId,
      data: { isActive: !banner.isActive },
    });
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex flex-col" dir="rtl">
      <Header
        title="بنرها"
        description="مدیریت بنرهای تبلیغاتی نمایش‌داده‌شده در فروشگاه."
      />
      <div className="flex-1 p-6 space-y-6">
        {/* Actions Bar */}
        <div className="flex items-center justify-between">
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> افزودن بنر
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto" dir="rtl">
              <DialogHeader>
                <DialogTitle>
                  {editingBanner ? "ویرایش بنر" : "افزودن بنر جدید"}
                </DialogTitle>
                <DialogDescription>
                  {editingBanner
                    ? "اطلاعات بنر را به‌روزرسانی کنید."
                    : "یک بنر تبلیغاتی جدید بسازید."}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">عنوان بنر</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="حراج تابستانه"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">توضیحات</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="۵۰٪ تخفیف روی غذای حیوانات"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">تصویر بنر (دسکتاپ)</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setImageFile(e.target.files?.[0] ?? null)
                    }
                  />
                  {imageFile && (
                    <p className="text-xs text-muted-foreground">
                      انتخاب‌شده: {imageFile.name}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobileImage">تصویر بنر (موبایل)</Label>
                  <Input
                    id="mobileImage"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setMobileImageFile(e.target.files?.[0] ?? null)
                    }
                  />
                  {mobileImageFile && (
                    <p className="text-xs text-muted-foreground">
                      انتخاب‌شده: {mobileImageFile.name}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">یا آدرس تصویر (URL)</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, imageUrl: e.target.value })
                    }
                    placeholder="https://example.com/banner.jpg"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="link">لینک مقصد</Label>
                  <Input
                    id="link"
                    value={formData.link}
                    onChange={(e) =>
                      setFormData({ ...formData, link: e.target.value })
                    }
                    placeholder="https://example.com/sale"
                    dir="ltr"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="position">جایگاه</Label>
                    <Select
                      value={formData.position}
                      onValueChange={(value) =>
                        setFormData({ ...formData, position: value })
                      }
                    >
                      <SelectTrigger id="position">
                        <SelectValue placeholder="انتخاب جایگاه" />
                      </SelectTrigger>
                      <SelectContent>
                        {BANNER_POSITION_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="order">ترتیب</Label>
                    <Input
                      id="order"
                      type="number"
                      value={formData.order}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          order: parseInt(e.target.value) || 1,
                        })
                      }
                      placeholder="1"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isActive: checked })
                    }
                  />
                  <Label htmlFor="isActive">بنر فعال باشد</Label>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  انصراف
                </Button>
                <Button onClick={handleSubmit} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                      در حال ذخیره...
                    </>
                  ) : editingBanner ? (
                    "به‌روزرسانی بنر"
                  ) : (
                    "ایجاد بنر"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Banners Grid */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">همه بنرها</CardTitle>
            <CardDescription>
              مجموعاً {(response?.total ?? 0).toLocaleString("fa-IR")} بنر
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {banners.map((banner) => (
                  <div
                    key={banner.id}
                    className="relative border border-border rounded-lg overflow-hidden bg-secondary/50 hover:border-primary/50 transition-colors"
                  >
                    <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
                      {banner.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={banner.imageUrl}
                          alt={banner.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-12 w-12 text-muted-foreground" />
                      )}
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {banner.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {banner.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="outline">
                          {bannerPositionLabel(banner.position)}
                        </Badge>
                        <Badge variant="outline">
                          #{banner.order.toLocaleString("fa-IR")}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={
                            banner.isActive
                              ? "bg-green-500/15 text-green-600 border-green-500/30"
                              : "bg-muted text-muted-foreground"
                          }
                        >
                          {banner.isActive ? "فعال" : "غیرفعال"}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => toggleActive(banner.id)}
                        >
                          {banner.isActive ? "غیرفعال‌کردن" : "فعال‌کردن"}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => openEditDialog(banner.id)}
                            >
                              <Pencil className="h-4 w-4 ml-2" /> ویرایش
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(banner.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 ml-2" /> حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
