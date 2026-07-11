"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { bannerService } from "./banner-api";
import { queryKeys } from "@/features/query-keys";

export function useBanners() {
  return useQuery({
    queryKey: queryKeys.banners,
    queryFn: bannerService.getBanners,
    staleTime: 5 * 60 * 1000,
  });
}

// پنل ادمین — همه‌ی بنرها با صفحه‌بندی
export function useAdminBanners(page = 1, limit = 10) {
  return useQuery({
    queryKey: [...queryKeys.banners, "admin", page, limit],
    queryFn: () => bannerService.getAdminBanners(page, limit),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useBanner(id: string) {
  return useQuery({
    queryKey: queryKeys.banner(id),
    queryFn: () => bannerService.getBanner(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
