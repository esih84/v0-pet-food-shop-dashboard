'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Banner } from '@/lib/data'

export interface CreateBannerInput {
  title: string
  subtitle: string
  link: string
  position: number
  active: boolean
}

export interface UpdateBannerInput extends Partial<CreateBannerInput> {}

// Fetch all banners
export function useBanners() {
  return useQuery({
    queryKey: ['banners'],
    queryFn: async () => {
      const response = await fetch('/api/banners')
      if (!response.ok) throw new Error('Failed to fetch banners')
      return response.json() as Promise<Banner[]>
    },
  })
}

// Fetch single banner
export function useBanner(id: string) {
  return useQuery({
    queryKey: ['banner', id],
    queryFn: async () => {
      const response = await fetch(`/api/banners/${id}`)
      if (!response.ok) throw new Error('Failed to fetch banner')
      return response.json() as Promise<Banner>
    },
  })
}

// Create banner
export function useCreateBanner() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateBannerInput) => {
      const response = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to create banner')
      return response.json() as Promise<Banner>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] })
    },
  })
}

// Update banner
export function useUpdateBanner(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: UpdateBannerInput) => {
      const response = await fetch(`/api/banners/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to update banner')
      return response.json() as Promise<Banner>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] })
      queryClient.invalidateQueries({ queryKey: ['banner', id] })
    },
  })
}

// Delete banner
export function useDeleteBanner(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/banners/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete banner')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] })
    },
  })
}
