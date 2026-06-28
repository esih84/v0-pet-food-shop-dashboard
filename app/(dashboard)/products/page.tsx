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
} from "lucide-react";
import { useProducts } from "@/features/product/queries";
import {
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "@/features/product/mutations";
import { useCategories } from "@/features/category/queries";
import type { ProductAttribute } from "@/lib/types/product";

const toman = (v: number) => `${Math.round(v).toLocaleString("fa-IR")} تومان`;

export default function ProductsPage() {
  const { data, isLoading, error } = useProducts();
  const { data: categories = [] } = useCategories();

  const products = data?.data ?? [];

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
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
      description: "",
      categoryId: "",
      basePrice: 0,
      stock: 0,
      sku: "",
      isActive: true,
    });
    setAttributes([{ key: "", value: "" }]);
    setImageFiles([]);
    setEditingProductId(null);
  };

  const openEditDialog = (productId: string) => {
    setEditingProductId(productId);
    const product = products.find((p) => p.id === productId);
    if (product) {
      setFormData({
        name: product.name,
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
      setImageFiles([]);
      setIsDialogOpen(true);
    }
  };

  const handleSubmit = async () => {
    const filteredAttributes = attributes.filter((a) => a.key && a.value);
    const payload = {
      name: formData.name,
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
      <Header
        title="محصولات"
        description="مدیریت محصولات، موجودی و مشخصات."
      />
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

              <div className="space-y-6 py-4">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">
                    اطلاعات پایه
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">نام محصول</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
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
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isActive: checked })
                      }
                    />
                    <Label htmlFor="isActive">محصول فعال باشد</Label>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="images">
                      تصاویر محصول{" "}
                      <span className="text-xs text-muted-foreground">
                        (اولین تصویر، تصویر اصلی است)
                      </span>
                    </Label>
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
                        {imageFiles.length.toLocaleString("fa-IR")} تصویر
                        انتخاب شد
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
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  انصراف
                </Button>
                <Button onClick={handleSubmit} disabled={isSaving}>
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
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground" />
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
