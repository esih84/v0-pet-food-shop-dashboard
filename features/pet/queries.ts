"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { petService } from "./pet-api";
import { queryKeys } from "@/features/query-keys";

export function usePets(page = 1, limit = 50) {
  return useQuery({
    queryKey: [...queryKeys.pets, page, limit],
    queryFn: () => petService.getPets(page, limit),
    staleTime: 2 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}
