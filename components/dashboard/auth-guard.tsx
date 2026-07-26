"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useCurrentAdmin } from "@/features/auth/queries";

/**
 * Guards dashboard routes: if the admin user is not logged in, redirects to /login.
 * Authentication is cookie-based; the state is read from /users/me.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: admin, isLoading } = useCurrentAdmin();

  useEffect(() => {
    if (!isLoading && (!admin || admin.role !== "admin")) {
      router.replace("/login");
    }
  }, [admin, isLoading, router]);

  if (isLoading || !admin || admin.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
