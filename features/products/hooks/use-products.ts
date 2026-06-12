import { useQuery } from "@tanstack/react-query";
import { productsApi } from "../api/products.api";
import { productKeys } from "../query-keys";

export function useProducts() {
  return useQuery({
    queryKey: productKeys.all,
    queryFn: productsApi.getProducts,
    staleTime: 5 * 60 * 1000,
  });
}
