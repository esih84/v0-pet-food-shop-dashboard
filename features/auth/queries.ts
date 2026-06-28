"use client";

import { useQuery } from "@tanstack/react-query";
import { authClient, type AdminUser } from "@/lib/auth/auth-client";
import { CURRENT_ADMIN_KEY } from "@/features/query-keys";

/** کاربر فعلی (از روی کوکی). اگر لاگین نباشد null. */
export function useCurrentAdmin() {
  return useQuery<AdminUser | null>({
    queryKey: CURRENT_ADMIN_KEY,
    queryFn: async () => {
      try {
        return await authClient.me();
      } catch {
        return null;
      }
    },
    staleTime: 1000 * 60,
    retry: false,
  });
}
