"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { blogService, type UpdateBlogInput } from "./blog-api";
import { queryKeys } from "@/features/query-keys";

export function useCreateBlog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: blogService.createBlog,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.blogs }),
  });
}

export function useUpdateBlog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBlogInput }) =>
      blogService.updateBlog(id, data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.blogs });
      qc.invalidateQueries({ queryKey: queryKeys.blog(variables.id) });
    },
  });
}

export function useDeleteBlog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: blogService.deleteBlog,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.blogs }),
  });
}
