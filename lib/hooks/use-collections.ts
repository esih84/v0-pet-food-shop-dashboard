'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Collection } from '@/lib/data'

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
      const response = await fetch('/api/collections')
      if (!response.ok) throw new Error('Failed to fetch collections')
      return response.json() as Promise<Collection[]>
    },
  })
}

// Fetch single collection
export function useCollection(id: string) {
  return useQuery({
    queryKey: ['collection', id],
    queryFn: async () => {
      const response = await fetch(`/api/collections/${id}`)
      if (!response.ok) throw new Error('Failed to fetch collection')
      return response.json() as Promise<Collection>
    },
  })
}

// Create collection
export function useCreateCollection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateCollectionInput) => {
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to create collection')
      return response.json() as Promise<Collection>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] })
    },
  })
}

// Update collection
export function useUpdateCollection(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: UpdateCollectionInput) => {
      const response = await fetch(`/api/collections/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to update collection')
      return response.json() as Promise<Collection>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] })
      queryClient.invalidateQueries({ queryKey: ['collection', id] })
    },
  })
}

// Delete collection
export function useDeleteCollection(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/collections/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete collection')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] })
    },
  })
}
