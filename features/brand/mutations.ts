"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { brandService, type UpdateBrandInput } from "./brand-api";
import { queryKeys } from "@/features/query-keys";

export function useCreateBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: brandService.createBrand,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.brands }),
  });
}

export function useUpdateBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBrandInput }) =>
      brandService.updateBrand(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.brands }),
  });
}

export function useDeleteBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: brandService.deleteBrand,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.brands }),
  });
}
