"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { blogService } from "./blog-api";
import { queryKeys } from "@/features/query-keys";

export function useBlogs(page = 1, limit = 10) {
  return useQuery({
    queryKey: [...queryKeys.blogs, page, limit],
    queryFn: () => blogService.getBlogs(page, limit),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useBlog(id: string) {
  return useQuery({
    queryKey: queryKeys.blog(id),
    queryFn: () => blogService.getBlog(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
