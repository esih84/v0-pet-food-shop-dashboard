"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bannerService, type UpdateBannerInput } from "./banner-api";
import { queryKeys } from "@/features/query-keys";

export function useCreateBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: bannerService.createBanner,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.banners }),
  });
}

export function useUpdateBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBannerInput }) =>
      bannerService.updateBanner(id, data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.banners });
      qc.invalidateQueries({ queryKey: queryKeys.banner(variables.id) });
    },
  });
}

export function useDeleteBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: bannerService.deleteBanner,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.banners }),
  });
}
