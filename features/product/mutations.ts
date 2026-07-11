"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productService, type CreateDiscountInput } from "./product-api";
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

export function useImportProducts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => productService.importProducts(file),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.products }),
  });
}

export function useDeleteProductImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      productId,
      imageId,
    }: {
      productId: string;
      imageId: string;
    }) => productService.deleteProductImage(productId, imageId),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.products });
      qc.invalidateQueries({ queryKey: queryKeys.product(variables.productId) });
    },
  });
}

export function useReorderProductImages() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      productId,
      imageIds,
    }: {
      productId: string;
      imageIds: string[];
    }) => productService.reorderProductImages(productId, imageIds),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.products });
      qc.invalidateQueries({ queryKey: queryKeys.product(variables.productId) });
    },
  });
}

export function useAddProductDiscount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      productId,
      data,
    }: {
      productId: string;
      data: CreateDiscountInput;
    }) => productService.addProductDiscount(productId, data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.products });
      qc.invalidateQueries({ queryKey: queryKeys.product(variables.productId) });
    },
  });
}

export function useRemoveProductDiscount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      productId,
      discountId,
    }: {
      productId: string;
      discountId: string;
    }) => productService.removeProductDiscount(productId, discountId),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.products });
      qc.invalidateQueries({ queryKey: queryKeys.product(variables.productId) });
    },
  });
}
