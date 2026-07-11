"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { collectionService } from "./collection-api";
import { queryKeys } from "@/features/query-keys";

export function useCollections() {
  return useQuery({
    queryKey: queryKeys.collections,
    queryFn: collectionService.getCollections,
    staleTime: 5 * 60 * 1000,
  });
}

// پنل ادمین — همه‌ی کالکشن‌ها با صفحه‌بندی
export function useAdminCollections(page = 1, limit = 10) {
  return useQuery({
    queryKey: [...queryKeys.collections, "admin", page, limit],
    queryFn: () => collectionService.getAdminCollections(page, limit),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useCollection(id: string) {
  return useQuery({
    queryKey: queryKeys.collection(id),
    queryFn: () => collectionService.getCollection(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
