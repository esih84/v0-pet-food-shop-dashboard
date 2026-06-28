"use client";

import { useQuery } from "@tanstack/react-query";
import { blogService } from "./blog-api";
import { queryKeys } from "@/features/query-keys";

export function useBlogs() {
  return useQuery({
    queryKey: queryKeys.blogs,
    queryFn: blogService.getBlogs,
    staleTime: 5 * 60 * 1000,
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
