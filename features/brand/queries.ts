"use client";

import { useQuery } from "@tanstack/react-query";
import { brandService } from "./brand-api";
import { queryKeys } from "@/features/query-keys";

export function useBrands() {
  return useQuery({
    queryKey: queryKeys.brands,
    queryFn: brandService.getBrands,
    staleTime: 5 * 60 * 1000,
  });
}
