"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { CURRENT_ADMIN_KEY } from "@/features/query-keys";

/** useAuth — admin authentication via mobile OTP (cookie-based). */
export const useAuth = () => {
  const router = useRouter();
  const qc = useQueryClient();

  const sendOtp = useMutation({
    mutationFn: (phone: string) => authClient.sendOtp(phone),
  });

  const verifyOtp = useMutation({
    mutationFn: ({ phone, code }: { phone: string; code: string }) =>
      authClient.verifyOtp(phone, code),
    onSuccess: async (data) => {
      // Only an admin is allowed to log into the dashboard
      if (data.user.role !== "admin") {
        await authClient.logout();
        throw new Error("شما دسترسی ادمین ندارید.");
      }
      qc.setQueryData(CURRENT_ADMIN_KEY, data.user);
      router.push("/");
    },
  });

  const logout = useMutation({
    mutationFn: () => authClient.logout(),
    onSuccess: () => {
      qc.setQueryData(CURRENT_ADMIN_KEY, null);
      qc.clear();
      router.push("/login");
    },
  });

  return {
    sendOtp: sendOtp.mutateAsync,
    sendOtpPending: sendOtp.isPending,
    verifyOtp: verifyOtp.mutateAsync,
    verifyOtpPending: verifyOtp.isPending,
    verifyOtpError: verifyOtp.error,
    logout: logout.mutate,
    logoutPending: logout.isPending,
  };
};
