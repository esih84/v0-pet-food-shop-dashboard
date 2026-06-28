"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryService } from "./category-api";
import { queryKeys } from "@/features/query-keys";

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: categoryService.createCategory,
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
