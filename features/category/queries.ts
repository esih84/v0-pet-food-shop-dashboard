"use client";

import { useQuery } from "@tanstack/react-query";
import { categoryService } from "./category-api";
import { queryKeys } from "@/features/query-keys";

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: categoryService.getCategories,
    staleTime: 5 * 60 * 1000,
  });
}
