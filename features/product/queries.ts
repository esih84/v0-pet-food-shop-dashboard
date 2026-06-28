"use client";

import { useQuery } from "@tanstack/react-query";
import { productService } from "./product-api";
import { queryKeys } from "@/features/query-keys";

export function useProducts(page = 1, limit = 50) {
  return useQuery({
    queryKey: [...queryKeys.products, page, limit],
    queryFn: () => productService.getProducts(page, limit),
    staleTime: 5 * 60 * 1000,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.product(id),
    queryFn: () => productService.getProduct(id),
    enabled: !!id,
  });
}
