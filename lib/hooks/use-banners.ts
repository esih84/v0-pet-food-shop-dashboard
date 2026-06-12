"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Banner } from "@/lib/data";
import axiosInstance from "@/lib/auth/axios-instance";
import { ApiResponse } from "../types/api";

export interface CreateBannerInput {
  title: string;
  description?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  link?: string;
  position?: string;
  order?: number;
  isActive?: boolean;
  startDate?: Date | string;
  endDate?: Date | string;
}

export interface UpdateBannerInput extends Partial<CreateBannerInput> {}

// Fetch all banners for admin
export function useBanners() {
  return useQuery({
    queryKey: ["banners"],
    queryFn: async () => {
      const { data } =
        await axiosInstance.get<ApiResponse<Banner[]>>("/banners");
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useBanner(id: string) {
  return useQuery({
    queryKey: ["banner", id],
    queryFn: async () => {
      const { data } = await axiosInstance.get<ApiResponse<Banner>>(
        `/banners/${id}`,
      );
      return data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateBannerInput) => {
      const { data } = await axiosInstance.post<Banner>("/banners", input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    },
  });
}

export function useUpdateBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateBannerInput;
    }) => {
      const { data: updated } = await axiosInstance.put<Banner>(
        `/banners/${id}`,
        data,
      );
      return updated;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      queryClient.invalidateQueries({ queryKey: ["banner", variables.id] });
    },
  });
}

export function useDeleteBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/banners/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    },
  });
}
