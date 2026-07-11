"use client";

import { useState } from "react";
import { Header } from "@/components/dashboard/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  FolderOpen,
  Loader2,
} from "lucide-react";
import { useAdminCollections } from "@/features/collection/queries";
import {
  useCreateCollection,
  useUpdateCollection,
  useDeleteCollection,
} from "@/features/collection/mutations";
import { DataPagination } from "@/components/dashboard/data-pagination";
import { PAGE_SIZE } from "@/lib/pagination";

function slugify(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^\w؀-ۿ-]/g, "");
}

export default function CollectionsPage() {
  const [page, setPage] = useState(1);
  const { data: response, isLoading } = useAdminCollections(page, PAGE_SIZE);
  const collections = response?.data ?? [];
  const createMutation = useCreateCollection();
  const updateMutation = useUpdateCollection();
  const deleteMutation = useDeleteCollection();

  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCollectionId, setEditingCollectionId] = useState<string | null>(
    null,
  );

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    isActive: true,
  });

  const editingCollection = collections.find(
    (c) => c.id === editingCollectionId,
  );

  const filteredCollections = collections.filter((collection) =>
    collection.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const resetForm = () => {
    setFormData({ name: "", slug: "", description: "", isActive: true });
    setEditingCollectionId(null);
  };

  const openEditDialog = (collectionId: string) => {
    setEditingCollectionId(collectionId);
    const collection = collections.find((c) => c.id === collectionId);
    if (collection) {
      setFormData({
        name: collection.name,
        slug: collection.slug,
        description: collection.description ?? "",
        isActive: collection.isActive,
      });
      setIsDialogOpen(true);
    }
  };

  const handleSubmit = async () => {
    const payload = {
      name: formData.name,
      slug: formData.slug || slugify(formData.name),
      description: formData.description || undefined,
      isActive: formData.isActive,
    };
    if (editingCollectionId) {
      await updateMutation.mutateAsync({ id: editingCollectionId, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm("حذف این کالکشن؟")) await deleteMutation.mutateAsync(id);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex flex-col" dir="rtl">
      <Header
        title="کالکشن‌ها"
        description="محصولات را در قالب کالکشن دسته‌بندی کنید."
      />
      <div className="flex-1 p-6 space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="جستجو در این صفحه..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-9 bg-input"
            />
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
                <Plus className="h-4 w-4" /> افزودن کالکشن
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg" dir="rtl">
              <DialogHeader>
                <DialogTitle>
                  {editingCollection ? "ویرایش کالکشن" : "افزودن کالکشن جدید"}
                </DialogTitle>
                <DialogDescription>
                  {editingCollection
                    ? "اطلاعات کالکشن را به‌روزرسانی کنید."
                    : "یک کالکشن جدید برای دسته‌بندی محصولات بسازید."}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">نام کالکشن</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value,
                        slug: editingCollection
                          ? formData.slug
                          : slugify(e.target.value),
                      })
                    }
                    placeholder="غذای سگ"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">نامک (slug)</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    placeholder="dog-food"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">توضیحات</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="تغذیه‌ی باکیفیت برای همراه چهارپای شما"
                    rows={3}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isActive: checked })
                    }
                  />
                  <Label htmlFor="isActive">کالکشن فعال باشد</Label>
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
                  ) : editingCollection ? (
                    "به‌روزرسانی کالکشن"
                  ) : (
                    "ایجاد کالکشن"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Collections Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCollections.map((collection) => (
              <Card
                key={collection.id}
                className="bg-card border-border overflow-hidden"
              >
                <div className="h-32 bg-muted flex items-center justify-center">
                  <FolderOpen className="h-12 w-12 text-muted-foreground" />
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">
                        {collection.name}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {collection.description}
                      </p>
                      <div className="flex items-center gap-2 pt-2">
                        <Badge
                          variant="outline"
                          className={
                            collection.isActive
                              ? "bg-green-500/15 text-green-600 border-green-500/30"
                              : "bg-muted text-muted-foreground border-muted"
                          }
                        >
                          {collection.isActive ? "فعال" : "غیرفعال"}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => openEditDialog(collection.id)}
                        >
                          <Pencil className="h-4 w-4 ml-2" /> ویرایش
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(collection.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 ml-2" /> حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <DataPagination
          page={page}
          totalPages={response?.totalPages ?? 1}
          total={response?.total}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
