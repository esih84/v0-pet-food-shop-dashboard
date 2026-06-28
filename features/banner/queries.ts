"use client";

import { useQuery } from "@tanstack/react-query";
import { bannerService } from "./banner-api";
import { queryKeys } from "@/features/query-keys";

export function useBanners() {
  return useQuery({
    queryKey: queryKeys.banners,
    queryFn: bannerService.getBanners,
    staleTime: 5 * 60 * 1000,
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
