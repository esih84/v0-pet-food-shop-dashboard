"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "./product-api";
import { queryKeys } from "@/features/query-keys";
import type { UpdateProductInput } from "@/lib/types/product";

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productService.createProduct,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.products }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductInput }) =>
      productService.updateProduct(id, data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.products });
      qc.invalidateQueries({ queryKey: queryKeys.product(variables.id) });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productService.deleteProduct,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.products }),
  });
}
