"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Image,
  FolderOpen,
  FolderTree,
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
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/mutations";

const navItems = [
  { href: "/", label: "داشبورد", icon: LayoutDashboard },
  { href: "/products", label: "محصولات", icon: Package },
  { href: "/categories", label: "دسته‌بندی‌ها", icon: FolderTree },
  { href: "/orders", label: "سفارش‌ها", icon: ShoppingCart },
  { href: "/customers", label: "مشتریان", icon: Users },
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

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-border bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <PawPrint className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">پنل مدیریت</span>
          </Link>
        )}
        {collapsed && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary mx-auto">
            <PawPrint className="h-5 w-5 text-primary-foreground" />
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute left-full top-20 -translate-x-1/2 z-10 h-6 w-6 rounded-full border border-border bg-background shadow-sm"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>

      <nav className="flex-1 space-y-1 p-3">
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
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
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
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
          )}
        >
          <Settings className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>تنظیمات</span>}
        </Link>
        <button
          onClick={() => logout()}
          disabled={logoutPending}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground disabled:opacity-60"
          )}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>خروج</span>}
        </button>
      </div>
    </aside>
  );
}
