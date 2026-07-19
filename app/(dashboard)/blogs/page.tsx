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
import { Textarea } from "@/components/ui/textarea";
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
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  FileText,
  Loader2,
} from "lucide-react";
import { useBlogs } from "@/features/blog/queries";
import {
  useCreateBlog,
  useUpdateBlog,
  useDeleteBlog,
} from "@/features/blog/mutations";
import { DataPagination } from "@/components/dashboard/data-pagination";
import { PAGE_SIZE } from "@/lib/pagination";
import { RichTextEditor } from "@/components/rich-text-editor";

function slugify(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^\w؀-ۿ-]/g, "");
}

export default function BlogsPage() {
  const [page, setPage] = useState(1);
  const { data: response, isLoading } = useBlogs(page, PAGE_SIZE);
  const blogs = response?.data ?? [];
  const createMutation = useCreateBlog();
  const updateMutation = useUpdateBlog();
  const deleteMutation = useDeleteBlog();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featuredImage: "",
    isPublished: false,
  });

  const editingBlog = blogs.find((b) => b.id === editingBlogId);

  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch = blog.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" ? blog.isPublished : !blog.isPublished);
    return matchesSearch && matchesStatus;
  });

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      featuredImage: "",
      isPublished: false,
    });
    setEditingBlogId(null);
  };

  const openEditDialog = (blogId: string) => {
    setEditingBlogId(blogId);
    const blog = blogs.find((b) => b.id === blogId);
    if (blog) {
      setFormData({
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt ?? "",
        content: blog.content,
        featuredImage: blog.featuredImage ?? "",
        isPublished: blog.isPublished,
      });
      setIsDialogOpen(true);
    }
  };

  const handleSubmit = async () => {
    const payload = {
      title: formData.title,
      slug: formData.slug || slugify(formData.title),
      content: formData.content,
      excerpt: formData.excerpt || undefined,
      featuredImage: formData.featuredImage || undefined,
      isPublished: formData.isPublished,
    };
    if (editingBlogId) {
      await updateMutation.mutateAsync({ id: editingBlogId, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm("حذف این مطلب؟")) await deleteMutation.mutateAsync(id);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex flex-col" dir="rtl">
      <Header
        title="بلاگ"
        description="ساخت و مدیریت مقالات و مطالب نگهداری حیوانات."
      />
      <div className="flex-1 p-6 space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="جستجو در این صفحه..."
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
                <SelectItem value="published">منتشرشده</SelectItem>
                <SelectItem value="draft">پیش‌نویس</SelectItem>
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
                <Plus className="h-4 w-4" /> افزودن مطلب
              </Button>
            </DialogTrigger>
            <DialogContent
              className="max-w-2xl max-h-[90vh] overflow-y-auto"
              dir="rtl"
            >
              <DialogHeader>
                <DialogTitle>
                  {editingBlog ? "ویرایش مطلب" : "افزودن مطلب جدید"}
                </DialogTitle>
                <DialogDescription>
                  {editingBlog
                    ? "اطلاعات و محتوای مطلب را به‌روزرسانی کنید."
                    : "یک مطلب جدید درباره‌ی نگهداری حیوانات بنویسید."}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">عنوان</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        title: e.target.value,
                        slug: editingBlog
                          ? formData.slug
                          : slugify(e.target.value),
                      })
                    }
                    placeholder="چطور غذای مناسب سگ را انتخاب کنیم"
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
                    placeholder="choose-dog-food"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="featuredImage">آدرس تصویر شاخص</Label>
                  <Input
                    id="featuredImage"
                    value={formData.featuredImage}
                    onChange={(e) =>
                      setFormData({ ...formData, featuredImage: e.target.value })
                    }
                    placeholder="https://..."
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="excerpt">خلاصه</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) =>
                      setFormData({ ...formData, excerpt: e.target.value })
                    }
                    placeholder="خلاصه‌ی کوتاه مطلب..."
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">محتوا</Label>
                  <RichTextEditor
                    value={formData.content}
                    onChange={(html) =>
                      setFormData({ ...formData, content: html })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    برای مقاله‌ی کامل تولیدشده با هوش مصنوعی، تب «HTML» را باز کنید
                    و قطعه‌ی HTML مقاله را بچسبانید.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="isPublished"
                    checked={formData.isPublished}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isPublished: checked })
                    }
                  />
                  <Label htmlFor="isPublished">منتشر شود</Label>
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
                  ) : editingBlog ? (
                    "به‌روزرسانی مطلب"
                  ) : (
                    "ایجاد مطلب"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Blogs Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">همه مطالب</CardTitle>
            <CardDescription>
              {(response?.total ?? 0).toLocaleString("fa-IR")} مطلب
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
                      عنوان
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
                  {filteredBlogs.map((blog) => (
                    <TableRow key={blog.id} className="border-border">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {blog.title}
                            </p>
                            <p className="text-xs text-muted-foreground truncate max-w-[240px]">
                              {blog.excerpt}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            blog.isPublished
                              ? "bg-green-500/15 text-green-600 border-green-500/30"
                              : "bg-amber-500/15 text-amber-600 border-amber-500/30"
                          }
                        >
                          {blog.isPublished ? "منتشرشده" : "پیش‌نویس"}
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
                              onClick={() => openEditDialog(blog.id)}
                            >
                              <Pencil className="h-4 w-4 ml-2" /> ویرایش
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(blog.id)}
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
