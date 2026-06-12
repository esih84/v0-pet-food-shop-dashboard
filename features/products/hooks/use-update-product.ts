import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productsApi } from "../api/products.api";
import { productKeys } from "../query-keys";
import { UpdateProductInput } from "@/lib/types/product";

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductInput }) =>
      productsApi.updateProduct(id, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: productKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.id),
      });
    },
  });
}
