"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  collectionService,
  type UpdateCollectionInput,
} from "./collection-api";
import { queryKeys } from "@/features/query-keys";

export function useCreateCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: collectionService.createCollection,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.collections }),
  });
}

export function useUpdateCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCollectionInput }) =>
      collectionService.updateCollection(id, data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.collections });
      qc.invalidateQueries({ queryKey: queryKeys.collection(variables.id) });
    },
  });
}

export function useDeleteCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: collectionService.deleteCollection,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.collections }),
  });
}
