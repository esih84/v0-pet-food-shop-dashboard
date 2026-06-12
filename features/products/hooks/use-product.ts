import { useQuery } from "@tanstack/react-query";
import { productsApi } from "../api/products.api";
import { productKeys } from "../query-keys";

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productsApi.getProduct(id),
    enabled: !!id,
  });
}
