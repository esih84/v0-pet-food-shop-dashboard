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
  MoreHorizontal,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import {
  useBanners,
  useCreateBanner,
  useUpdateBanner,
  useDeleteBanner,
} from "@/lib/hooks/use-banners";

export default function BannersPage() {
  const { data: banners = [], isLoading } = useBanners();
  const createMutation = useCreateBanner();
  const updateMutation = useUpdateBanner("");
  const deleteMutation = useDeleteBanner("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    link: "",
    position: 1,
    active: true,
  });

  const editingBanner = banners.find((b) => b.id === editingBannerId);

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      link: "",
      position: banners.length + 1,
      active: true,
    });
    setEditingBannerId(null);
  };

  const openEditDialog = (bannerId: string) => {
    setEditingBannerId(bannerId);
    const banner = banners.find((b) => b.id === bannerId);
    if (banner) {
      setFormData({
        title: banner.title,
        subtitle: banner.subtitle,
        link: banner.link,
        position: banner.position,
        active: banner.active,
      });
      setIsDialogOpen(true);
    }
  };

  const handleSubmit = async () => {
    if (editingBanner) {
      await updateMutation.mutateAsync(editingBannerId!, formData);
    } else {
      await createMutation.mutateAsync(formData);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  const toggleActive = async (bannerId: string) => {
    const banner = banners.find((b) => b.id === bannerId);
    if (banner) {
      await updateMutation.mutateAsync(bannerId, {
        active: !banner.active,
      });
    }
  };

  return (
    <div className="flex flex-col">
      <Header
        title="Banners"
        description="Manage promotional banners displayed on your storefront."
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
                <Plus className="h-4 w-4" /> Add Banner
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingBanner ? "Edit Banner" : "Add New Banner"}
                </DialogTitle>
                <DialogDescription>
                  {editingBanner
                    ? "Update banner details."
                    : "Create a new promotional banner."}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Banner Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Summer Sale"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Input
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={(e) =>
                      setFormData({ ...formData, subtitle: e.target.value })
                    }
                    placeholder="Get 50% off pet food"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="link">Link URL</Label>
                  <Input
                    id="link"
                    value={formData.link}
                    onChange={(e) =>
                      setFormData({ ...formData, link: e.target.value })
                    }
                    placeholder="https://example.com/sale"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position Order</Label>
                  <Input
                    id="position"
                    type="number"
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        position: parseInt(e.target.value) || 1,
                      })
                    }
                    placeholder="1"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) =>
                      setFormData({ ...formData, active: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <Label htmlFor="active">Active</Label>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : editingBanner ? (
                    "Update Banner"
                  ) : (
                    "Create Banner"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Banners Grid */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">All Banners</CardTitle>
            <CardDescription>
              {banners.length} banner{banners.length !== 1 ? "s" : ""} total
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
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {banner.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {banner.subtitle}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">#{banner.position}</Badge>
                        <Badge
                          variant="outline"
                          className={
                            banner.active
                              ? "bg-success/20 text-success border-success/30"
                              : "bg-muted text-muted-foreground"
                          }
                        >
                          {banner.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => toggleActive(banner.id)}
                        >
                          {banner.active ? "Deactivate" : "Activate"}
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
                              <Pencil className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(banner.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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
