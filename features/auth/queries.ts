"use client";

import { useQuery } from "@tanstack/react-query";
import { authClient, type AdminUser } from "@/lib/auth/auth-client";
import { CURRENT_ADMIN_KEY } from "@/features/query-keys";

/** Current user (from the cookie). null if not logged in. */
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
