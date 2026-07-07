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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Package,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAdminProducts } from "@/features/product/queries";
import {
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useDeleteProductImage,
  useReorderProductImages,
  useAddProductDiscount,
  useRemoveProductDiscount,
} from "@/features/product/mutations";
import { useCategories } from "@/features/category/queries";
import { productService } from "@/features/product/product-api";
import type {
  ProductAttribute,
  ProductImage,
  Discount,
  DiscountType,
} from "@/lib/types/product";

/** آدرس تصویر اصلی (یا اولین تصویر) محصول را برمی‌گرداند. */
const primaryImageUrl = (images?: ProductImage[]): string | undefined => {
  if (!images?.length) return undefined;
  const primary = images.find((img) => img.isPrimary) ?? images[0];
  return primary.thumbnailUrl ?? primary.url;
};

/** ساخت اسلاگ از روی نام (فارسی/انگلیسی) برای پیشنهاد خودکار */
const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9؀-ۿ-]/g, "")
    .replace(/-+/g, "-");

const toman = (v: number) => `${Math.round(v).toLocaleString("fa-IR")} تومان`;

export default function ProductsPage() {
  const { data, isLoading, error } = useAdminProducts();
  const { data: categories = [] } = useCategories();

  const products = data?.data ?? [];

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();
  const deleteImageMutation = useDeleteProductImage();
  const reorderImagesMutation = useReorderProductImages();
  const addDiscountMutation = useAddProductDiscount();
  const removeDiscountMutation = useRemoveProductDiscount();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isEditLoading, setIsEditLoading] = useState(false);
  // وقتی کاربر slug را دستی تغییر دهد، دیگر از روی نام تولید نمی‌شود
  const [slugTouched, setSlugTouched] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    categoryId: "",
    basePrice: 0,
    stock: 0,
    sku: "",
    isActive: true,
  });
  const [attributes, setAttributes] = useState<ProductAttribute[]>([
    { key: "", value: "" },
  ]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  // تصاویر فعلی محصول در حالت ویرایش (فقط برای نمایش)
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  // تخفیف‌های فعلی محصول در حالت ویرایش
  const [existingDiscounts, setExistingDiscounts] = useState<Discount[]>([]);
  const [discountForm, setDiscountForm] = useState({
    type: "percentage" as DiscountType,
    value: "",
    startDate: "",
    endDate: "",
  });

  const editingProduct = products.find((p) => p.id === editingProductId);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.category?.name ?? "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" ? product.isActive : !product.isActive);
    return matchesSearch && matchesStatus;
  });

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      categoryId: "",
      basePrice: 0,
      stock: 0,
      sku: "",
      isActive: true,
    });
    setAttributes([{ key: "", value: "" }]);
    setImageFiles([]);
    setExistingImages([]);
    setExistingDiscounts([]);
    setDiscountForm({ type: "percentage", value: "", startDate: "", endDate: "" });
    setEditingProductId(null);
    setSlugTouched(false);
  };

  const openEditDialog = async (productId: string) => {
    setEditingProductId(productId);
    setSlugTouched(true); // در حالت ویرایش، slug موجود حفظ می‌شود
    setImageFiles([]);
    setExistingImages([]);
    setIsDialogOpen(true);
    // اطلاعات کامل محصول (شامل مشخصات) را از سرور می‌گیریم چون لیست
    // محصولات همه‌ی فیلدها (مثل attributes) را برنمی‌گرداند.
    setIsEditLoading(true);
    try {
      const product = await productService.getAdminProduct(productId);
      setFormData({
        name: product.name,
        slug: product.slug ?? "",
        description: product.description ?? "",
        categoryId: product.categoryId ?? "",
        basePrice: product.basePrice,
        stock: product.stock,
        sku: product.sku ?? "",
        isActive: product.isActive,
      });
      setAttributes(
        product.attributes && product.attributes.length > 0
          ? product.attributes.map((a) => ({ key: a.key, value: a.value }))
          : [{ key: "", value: "" }],
      );
      setExistingImages(product.images ?? []);
      setExistingDiscounts(product.discounts ?? []);
    } finally {
      setIsEditLoading(false);
    }
  };

  // افزودن تخفیف به محصول در حال ویرایش
  const handleAddDiscount = async () => {
    if (!editingProductId) return;
    if (!discountForm.value || !discountForm.startDate || !discountForm.endDate)
      return;
    const updated = await addDiscountMutation.mutateAsync({
      productId: editingProductId,
      data: {
        type: discountForm.type,
        value: Number(discountForm.value),
        startDate: new Date(discountForm.startDate).toISOString(),
        endDate: new Date(discountForm.endDate).toISOString(),
      },
    });
    setExistingDiscounts(updated.discounts ?? []);
    setDiscountForm({ type: "percentage", value: "", startDate: "", endDate: "" });
  };

  // حذف تخفیف محصول
  const handleRemoveDiscount = async (discountId: string) => {
    if (!editingProductId) return;
    const updated = await removeDiscountMutation.mutateAsync({
      productId: editingProductId,
      discountId,
    });
    setExistingDiscounts(updated.discounts ?? []);
  };

  const handleSubmit = async () => {
    const filteredAttributes = attributes.filter((a) => a.key && a.value);
    const payload = {
      name: formData.name,
      slug: formData.slug.trim(),
      description: formData.description || undefined,
      categoryId: formData.categoryId || undefined,
      basePrice: Number(formData.basePrice),
      stock: Number(formData.stock),
      sku: formData.sku || undefined,
      isActive: formData.isActive,
      attributes: filteredAttributes,
      images: imageFiles.length > 0 ? imageFiles : undefined,
    };

    if (editingProductId) {
      await updateMutation.mutateAsync({ id: editingProductId, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm("حذف این محصول؟")) await deleteMutation.mutateAsync(id);
  };

  // حذف یکی از تصاویر فعلی محصول در حالت ویرایش
  const handleDeleteImage = async (imageId: string) => {
    if (!editingProductId) return;
    if (!confirm("حذف این تصویر؟")) return;
    const updated = await deleteImageMutation.mutateAsync({
      productId: editingProductId,
      imageId,
    });
    setExistingImages(updated.images ?? []);
  };

  // جابه‌جایی یک تصویر به چپ/راست و ذخیره‌ی ترتیب جدید (اولین تصویر، تصویر اصلی)
  const handleMoveImage = async (index: number, direction: -1 | 1) => {
    if (!editingProductId) return;
    const target = index + direction;
    if (target < 0 || target >= existingImages.length) return;
    const reordered = [...existingImages];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setExistingImages(reordered); // به‌روزرسانی خوش‌بینانه
    const updated = await reorderImagesMutation.mutateAsync({
      productId: editingProductId,
      imageIds: reordered.map((img) => img.id),
    });
    setExistingImages(updated.images ?? []);
  };

  const isImageBusy =
    deleteImageMutation.isPending || reorderImagesMutation.isPending;

  const addAttribute = () => {
    setAttributes([...attributes, { key: "", value: "" }]);
  };

  const removeAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const updateAttribute = (
    index: number,
    field: "key" | "value",
    value: string,
  ) => {
    setAttributes(
      attributes.map((a, i) => (i === index ? { ...a, [field]: value } : a)),
    );
  };

  if (error) {
    return (
      <div className="flex flex-col" dir="rtl">
        <Header
          title="محصولات"
          description="مدیریت محصولات، موجودی و مشخصات."
        />
        <div className="flex-1 p-6">
          <Card className="bg-destructive/10 border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">
                خطا در بارگذاری محصولات. لطفاً دوباره تلاش کنید.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex flex-col" dir="rtl">
      <Header title="محصولات" description="مدیریت محصولات، موجودی و مشخصات." />
      <div className="flex-1 p-6 space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="جستجوی محصولات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-9 bg-input"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] bg-input">
                <SelectValue placeholder="وضعیت" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه</SelectItem>
                <SelectItem value="active">فعال</SelectItem>
                <SelectItem value="inactive">غیرفعال</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> افزودن محصول
              </Button>
            </DialogTrigger>
            <DialogContent
              className="max-w-3xl max-h-[90vh] overflow-y-auto"
              dir="rtl"
            >
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? "ویرایش محصول" : "افزودن محصول جدید"}
                </DialogTitle>
                <DialogDescription>
                  {editingProduct
                    ? "اطلاعات محصول، موجودی و مشخصات را به‌روزرسانی کنید."
                    : "یک محصول جدید با قیمت، موجودی و مشخصات بسازید."}
                </DialogDescription>
              </DialogHeader>

              {isEditLoading && (
                <div className="flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  در حال بارگذاری اطلاعات محصول...
                </div>
              )}

              <div className="space-y-6 py-4">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">اطلاعات پایه</h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">نام محصول</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => {
                          const name = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            name,
                            slug: slugTouched ? prev.slug : slugify(name),
                          }));
                        }}
                        placeholder="غذای خشک سگ"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">دسته‌بندی</Label>
                      <Select
                        value={formData.categoryId}
                        onValueChange={(value) =>
                          setFormData({ ...formData, categoryId: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="انتخاب دسته‌بندی" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">
                      اسلاگ (آدرس) <span className="text-destructive">*</span>{" "}
                      <span className="text-xs text-muted-foreground">
                        در URL محصول استفاده می‌شود
                      </span>
                    </Label>
                    <Input
                      id="slug"
                      dir="ltr"
                      value={formData.slug}
                      onChange={(e) => {
                        setSlugTouched(true);
                        setFormData({ ...formData, slug: e.target.value });
                      }}
                      placeholder="dog-dry-food"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">توضیحات</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="توضیحات محصول..."
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="basePrice">قیمت (تومان)</Label>
                      <Input
                        id="basePrice"
                        type="number"
                        value={formData.basePrice}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            basePrice: parseFloat(e.target.value) || 0,
                          })
                        }
                        placeholder="290000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stock">موجودی</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={formData.stock}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            stock: parseInt(e.target.value) || 0,
                          })
                        }
                        placeholder="100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sku">کد محصول (SKU)</Label>
                      <Input
                        id="sku"
                        value={formData.sku}
                        onChange={(e) =>
                          setFormData({ ...formData, sku: e.target.value })
                        }
                        placeholder="DOG-PRE-2KG"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="isActive">محصول فعال باشد</Label>
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isActive: checked })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="images">
                      تصاویر محصول{" "}
                      <span className="text-xs text-muted-foreground">
                        (اولین تصویر، تصویر اصلی است)
                      </span>
                    </Label>
                    {existingImages.length > 0 && (
                      <div className="flex flex-wrap gap-3">
                        {existingImages.map((img, index) => (
                          <div
                            key={img.id}
                            className="w-24 overflow-hidden rounded-lg border border-border"
                          >
                            <div className="relative h-24 w-24">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={img.thumbnailUrl ?? img.url}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                              {img.isPrimary && (
                                <span className="absolute bottom-0 inset-x-0 bg-primary/80 text-primary-foreground text-[10px] text-center py-0.5">
                                  اصلی
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteImage(img.id)}
                                disabled={isImageBusy}
                                title="حذف تصویر"
                                className="absolute top-1 left-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive/90 text-white disabled:opacity-50"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                            <div className="flex items-center justify-between bg-muted px-1 py-1">
                              <button
                                type="button"
                                onClick={() => handleMoveImage(index, -1)}
                                disabled={isImageBusy || index === 0}
                                title="انتقال به قبل"
                                className="p-1 disabled:opacity-30"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </button>
                              <span className="text-[10px] text-muted-foreground">
                                {(index + 1).toLocaleString("fa-IR")}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleMoveImage(index, 1)}
                                disabled={
                                  isImageBusy ||
                                  index === existingImages.length - 1
                                }
                                title="انتقال به بعد"
                                className="p-1 disabled:opacity-30"
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {editingProduct && (
                      <p className="text-xs text-muted-foreground">
                        تصاویر جدید به تصاویر فعلی افزوده می‌شوند. با فلش‌ها ترتیب
                        را تغییر دهید (اولین تصویر، تصویر اصلی است).
                      </p>
                    )}
                    <Input
                      id="images"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) =>
                        setImageFiles(Array.from(e.target.files ?? []))
                      }
                    />
                    {imageFiles.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {imageFiles.length.toLocaleString("fa-IR")} تصویر انتخاب
                        شد
                      </p>
                    )}
                  </div>
                </div>

                {/* Attributes */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-foreground">
                      مشخصات محصول
                    </h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addAttribute}
                    >
                      <Plus className="h-4 w-4 ml-1" /> افزودن مشخصه
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {attributes.map((attr, index) => (
                      <div
                        key={index}
                        className="flex items-end gap-3 p-3 rounded-lg border border-border bg-secondary/50"
                      >
                        <div className="flex-1 space-y-2">
                          <Label>عنوان</Label>
                          <Input
                            value={attr.key}
                            onChange={(e) =>
                              updateAttribute(index, "key", e.target.value)
                            }
                            placeholder="پروتئین"
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <Label>مقدار</Label>
                          <Input
                            value={attr.value}
                            onChange={(e) =>
                              updateAttribute(index, "value", e.target.value)
                            }
                            placeholder="۲۸٪"
                          />
                        </div>
                        {attributes.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeAttribute(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Discounts — فقط در حالت ویرایش (محصول باید از قبل ساخته شده باشد) */}
                {editingProductId && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-foreground">
                      تخفیف‌های محصول
                    </h4>

                    {existingDiscounts.length > 0 ? (
                      <div className="space-y-2">
                        {existingDiscounts.map((d) => {
                          const now = Date.now();
                          const active =
                            d.isActive &&
                            new Date(d.startDate).getTime() <= now &&
                            new Date(d.endDate).getTime() >= now;
                          return (
                            <div
                              key={d.id}
                              className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-secondary/50"
                            >
                              <div className="flex items-center gap-2 text-sm">
                                <Badge
                                  variant="outline"
                                  className={
                                    active
                                      ? "bg-green-500/15 text-green-600 border-green-500/30"
                                      : "bg-gray-500/15 text-gray-600"
                                  }
                                >
                                  {active ? "فعال" : "غیرفعال"}
                                </Badge>
                                <span className="font-medium text-foreground">
                                  {d.type === "percentage"
                                    ? `${d.value}٪ تخفیف`
                                    : `${toman(d.value)} تخفیف`}
                                </span>
                                <span className="text-muted-foreground">
                                  {new Date(d.startDate).toLocaleDateString(
                                    "fa-IR",
                                  )}{" "}
                                  تا{" "}
                                  {new Date(d.endDate).toLocaleDateString(
                                    "fa-IR",
                                  )}
                                </span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveDiscount(d.id)}
                                disabled={removeDiscountMutation.isPending}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        هنوز تخفیفی برای این محصول ثبت نشده است.
                      </p>
                    )}

                    <div className="flex flex-wrap items-end gap-3 p-3 rounded-lg border border-dashed border-border">
                      <div className="space-y-2 w-32">
                        <Label>نوع</Label>
                        <select
                          value={discountForm.type}
                          onChange={(e) =>
                            setDiscountForm((f) => ({
                              ...f,
                              type: e.target.value as DiscountType,
                            }))
                          }
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="percentage">درصدی</option>
                          <option value="fixed">مبلغ ثابت</option>
                        </select>
                      </div>
                      <div className="space-y-2 w-32">
                        <Label>
                          {discountForm.type === "percentage"
                            ? "درصد"
                            : "مبلغ (تومان)"}
                        </Label>
                        <Input
                          type="number"
                          value={discountForm.value}
                          onChange={(e) =>
                            setDiscountForm((f) => ({
                              ...f,
                              value: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>از تاریخ</Label>
                        <Input
                          type="date"
                          value={discountForm.startDate}
                          onChange={(e) =>
                            setDiscountForm((f) => ({
                              ...f,
                              startDate: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>تا تاریخ</Label>
                        <Input
                          type="date"
                          value={discountForm.endDate}
                          onChange={(e) =>
                            setDiscountForm((f) => ({
                              ...f,
                              endDate: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddDiscount}
                        disabled={
                          addDiscountMutation.isPending ||
                          !discountForm.value ||
                          !discountForm.startDate ||
                          !discountForm.endDate
                        }
                      >
                        {addDiscountMutation.isPending ? (
                          <Loader2 className="h-4 w-4 ml-1 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4 ml-1" />
                        )}
                        افزودن تخفیف
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  انصراف
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={
                    isSaving ||
                    isEditLoading ||
                    !formData.name.trim() ||
                    !formData.slug.trim()
                  }
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                      در حال ذخیره...
                    </>
                  ) : editingProduct ? (
                    "به‌روزرسانی محصول"
                  ) : (
                    "ایجاد محصول"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Products Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">همه محصولات</CardTitle>
            <CardDescription>
              {filteredProducts.length.toLocaleString("fa-IR")} محصول یافت شد
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
                      محصول
                    </TableHead>
                    <TableHead className="text-muted-foreground text-right">
                      دسته‌بندی
                    </TableHead>
                    <TableHead className="text-muted-foreground text-right">
                      قیمت
                    </TableHead>
                    <TableHead className="text-muted-foreground text-right">
                      موجودی
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
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id} className="border-border">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                            {primaryImageUrl(product.images) ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={primaryImageUrl(product.images)}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Package className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {product.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {product.description}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground">
                        {product.category?.name ?? "—"}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {toman(product.basePrice)}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {(product.stock ?? 0).toLocaleString("fa-IR")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            product.isActive
                              ? "bg-green-500/15 text-green-600 border-green-500/30"
                              : "bg-muted text-muted-foreground border-muted"
                          }
                        >
                          {product.isActive ? "فعال" : "غیرفعال"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-left">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => openEditDialog(product.id)}
                            >
                              <Pencil className="h-4 w-4 ml-2" /> ویرایش
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(product.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 ml-2" /> حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
