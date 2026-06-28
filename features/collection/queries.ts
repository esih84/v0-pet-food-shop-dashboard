"use client";

import { useQuery } from "@tanstack/react-query";
import { collectionService } from "./collection-api";
import { queryKeys } from "@/features/query-keys";

export function useCollections() {
  return useQuery({
    queryKey: queryKeys.collections,
    queryFn: collectionService.getCollections,
    staleTime: 5 * 60 * 1000,
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
