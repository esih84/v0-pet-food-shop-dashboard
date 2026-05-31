"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { authClient, LoginResponse } from "@/lib/auth/auth-client";
import { tokenManager } from "@/lib/auth/token-manager";
import { useRouter } from "next/navigation";

/**
 * useAuth Hook - Handle authentication operations
 * Manages login, logout, and auth state
 */

export const useAuth = () => {
  const router = useRouter();

  // Check if user is authenticated
  const isAuthenticated = () => tokenManager.hasAccessToken();

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      return authClient.login(email, password);
    },
    onSuccess: (data: LoginResponse) => {
      // Store tokens
      tokenManager.setTokens(data.accessToken, data.refreshToken);
      // Redirect to dashboard
      router.push("/");
    },
    onError: (error) => {
      console.error("[v0] Login error:", error);
      tokenManager.clearTokens();
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await authClient.logout();
    },
    onSuccess: () => {
      tokenManager.clearTokens();
      router.push("/login");
    },
    onError: (error) => {
      console.error("[v0] Logout error:", error);
      tokenManager.clearTokens();
      router.push("/login");
    },
  });

  return {
    isAuthenticated,
    login: loginMutation.mutate,
    loginPending: loginMutation.isPending,
    loginError: loginMutation.error,
    logout: logoutMutation.mutate,
    logoutPending: logoutMutation.isPending,
    accessToken: tokenManager.getAccessToken(),
  };
};
