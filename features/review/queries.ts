"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { reviewService } from "./review-api";
import { queryKeys } from "@/features/query-keys";

export function useComments(page = 1, limit = 10) {
  return useQuery({
    queryKey: [...queryKeys.reviews, page, limit],
    queryFn: () => reviewService.getReviews(page, limit),
    staleTime: 2 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}
