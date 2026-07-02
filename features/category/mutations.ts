"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryService, type UpdateCategoryInput } from "./category-api";
import { queryKeys } from "@/features/query-keys";

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: categoryService.createCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.categories }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryInput }) =>
      categoryService.updateCategory(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.categories }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: categoryService.deleteCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.categories }),
  });
}
