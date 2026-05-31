'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Collection } from '@/lib/data'
import axiosInstance from '@/lib/auth/axios-instance'

export interface CreateCollectionInput {
  name: string
  description: string
  status: 'active' | 'draft'
}

export interface UpdateCollectionInput extends Partial<CreateCollectionInput> {}

// Fetch all collections
export function useCollections() {
  return useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      const { data } = await axiosInstance.get<Collection[]>('/api/collections')
      return data
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Fetch single collection
export function useCollection(id: string) {
  return useQuery({
    queryKey: ['collection', id],
    queryFn: async () => {
      const { data } = await axiosInstance.get<Collection>(`/api/collections/${id}`)
      return data
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Create collection
export function useCreateCollection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateCollectionInput) => {
      const { data } = await axiosInstance.post<Collection>('/api/collections', input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] })
    },
  })
}

// Update collection
export function useUpdateCollection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCollectionInput }) => {
      const response = await axiosInstance.put<Collection>(
        `/api/collections/${id}`,
        data
      )
      return response.data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['collections'] })
      queryClient.invalidateQueries({ queryKey: ['collection', variables.id] })
    },
  })
}

// Delete collection
export function useDeleteCollection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/api/collections/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] })
    },
  })
}
