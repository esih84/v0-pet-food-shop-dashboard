"use client";

import Link from "next/link";
import NextImage from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Image,
  FolderOpen,
  FolderTree,
  Tag,
  Ticket,
  Users,
  FileText,
  ShoppingCart,
  MessageSquare,
  PawPrint,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  PieChart,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/mutations";
import { useSidebar } from "@/components/dashboard/sidebar-context";

const navItems = [
  { href: "/", label: "داشبورد", icon: LayoutDashboard },
  { href: "/products", label: "محصولات", icon: Package },
  { href: "/categories", label: "دسته‌بندی‌ها", icon: FolderTree },
  { href: "/brands", label: "برندها", icon: Tag },
  { href: "/orders", label: "سفارش‌ها", icon: ShoppingCart },
  { href: "/customers", label: "مشتریان", icon: Users },
  { href: "/crm", label: "CRM", icon: PieChart },
  { href: "/pets", label: "حیوانات خانگی", icon: PawPrint },
  { href: "/coupons", label: "کدهای تخفیف", icon: Ticket },
  { href: "/banners", label: "بنرها", icon: Image },
  { href: "/collections", label: "کالکشن‌ها", icon: FolderOpen },
  { href: "/blogs", label: "بلاگ", icon: FileText },
  { href: "/comments", label: "نظرات", icon: MessageSquare },
  { href: "/sms", label: "پیامک", icon: MessageCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { logout, logoutPending } = useAuth();
  const { mobileOpen, closeMobile } = useSidebar();

  // با تغییر مسیر، کشوی موبایل بسته شود
  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  return (
    <>
      {/* پس‌زمینه‌ی تیره پشت کشو در موبایل */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeMobile}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "z-50 flex h-full flex-col border-l border-border bg-sidebar transition-all duration-300",
          // موبایل: کشوی ثابت که از سمت راست باز/بسته می‌شود
          "fixed inset-y-0 right-0 w-64 lg:relative lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0",
          // دسکتاپ: حالت باز/جمع‌شده
          collapsed ? "lg:w-16" : "lg:w-64",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2">
              <span className="rounded-lg bg-white px-2 py-1">
                <NextImage
                  src="/logo.png"
                  alt="PetMeal"
                  width={120}
                  height={32}
                  priority
                  className="h-6 w-auto object-contain"
                />
              </span>
              <span className="text-sm font-semibold text-foreground">
                پنل مدیریت
              </span>
            </Link>
          )}
          {collapsed && (
            <Link
              href="/"
              className="mx-auto rounded-lg bg-white px-1.5 py-1"
              aria-label="داشبورد"
            >
              <NextImage
                src="/logo.png"
                alt="PetMeal"
                width={80}
                height={22}
                priority
                className="h-5 w-auto object-contain"
              />
            </Link>
          )}

          {/* بستن کشو در موبایل */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 lg:hidden"
            onClick={closeMobile}
            aria-label="بستن منو"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* دکمه‌ی جمع‌کردن — فقط دسکتاپ */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-full top-20 z-10 hidden h-6 w-6 -translate-x-1/2 rounded-full border border-border bg-background shadow-sm lg:flex"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "باز کردن منو" : "جمع کردن منو"}
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>

        <nav className="no-scrollbar flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-primary"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground",
            )}
          >
            <Settings className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>تنظیمات</span>}
          </Link>
          <button
            onClick={() => logout()}
            disabled={logoutPending}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground disabled:opacity-60",
            )}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>خروج</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
