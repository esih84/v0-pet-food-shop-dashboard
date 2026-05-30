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
  MoreHorizontal,
  Pencil,
  Trash2,
  Image as ImageIcon,
  GripVertical,
} from "lucide-react";
import { banners as initialBanners, type Banner } from "@/lib/data";

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>(initialBanners);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    link: "",
    position: 1,
    status: "active" as "active" | "inactive",
  });

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      link: "",
      position: banners.length + 1,
      status: "active",
    });
    setEditingBanner(null);
  };

  const openEditDialog = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle,
      link: banner.link,
      position: banner.position,
      status: banner.status,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingBanner) {
      setBanners(
        banners.map((b) =>
          b.id === editingBanner.id
            ? { ...b, ...formData, image: b.image }
            : b
        )
      );
    } else {
      const newBanner: Banner = {
        id: Date.now().toString(),
        ...formData,
        image: "/placeholder.svg?height=300&width=1200",
      };
      setBanners([...banners, newBanner]);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const deleteBanner = (id: string) => {
    setBanners(banners.filter((b) => b.id !== id));
  };

  const toggleStatus = (id: string) => {
    setBanners(
      banners.map((b) =>
        b.id === id
          ? { ...b, status: b.status === "active" ? "inactive" : "active" }
          : b
      )
    );
  };

  return (
    <div className="flex flex-col">
      <Header
        title="Banners"
        description="Manage promotional banners for your storefront."
      />
      <div className="flex-1 p-6 space-y-6">
        {/* Actions Bar */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {banners.filter((b) => b.status === "active").length} active banner
            {banners.filter((b) => b.status === "active").length !== 1 ? "s" : ""}
          </p>
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
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingBanner ? "Edit Banner" : "Add New Banner"}
                </DialogTitle>
                <DialogDescription>
                  {editingBanner
                    ? "Update banner details and settings."
                    : "Create a new promotional banner for your store."}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Spring Sale - 30% Off"
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
                    placeholder="On all premium dog food"
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
                    placeholder="/collections/dog-food"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
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
                      min={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: "active" | "inactive") =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  {editingBanner ? "Update Banner" : "Create Banner"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Banners Grid */}
        <div className="grid gap-4">
          {banners
            .sort((a, b) => a.position - b.position)
            .map((banner) => (
              <Card key={banner.id} className="bg-card border-border overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="relative w-full md:w-80 h-40 bg-muted flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    <div className="absolute top-2 left-2 flex items-center gap-1 text-muted-foreground">
                      <GripVertical className="h-4 w-4" />
                      <span className="text-xs font-medium">#{banner.position}</span>
                    </div>
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">
                            {banner.title}
                          </h3>
                          <Badge
                            variant="outline"
                            className={
                              banner.status === "active"
                                ? "bg-success/20 text-success border-success/30"
                                : "bg-muted text-muted-foreground border-muted"
                            }
                          >
                            {banner.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {banner.subtitle}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Link: {banner.link}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(banner)}>
                            <Pencil className="h-4 w-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleStatus(banner.id)}>
                            {banner.status === "active" ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => deleteBanner(banner.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
        </div>
      </div>
    </div>
  );
}
