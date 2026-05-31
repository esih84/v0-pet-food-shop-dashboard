'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Banner } from '@/lib/data'
import axiosInstance from '@/lib/auth/axios-instance'

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
      const { data } = await axiosInstance.get<Banner[]>('/api/banners')
      return data
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Fetch single banner
export function useBanner(id: string) {
  return useQuery({
    queryKey: ['banner', id],
    queryFn: async () => {
      const { data } = await axiosInstance.get<Banner>(`/api/banners/${id}`)
      return data
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Create banner
export function useCreateBanner() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateBannerInput) => {
      const { data } = await axiosInstance.post<Banner>('/api/banners', input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] })
    },
  })
}

// Update banner
export function useUpdateBanner() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateBannerInput }) => {
      const response = await axiosInstance.put<Banner>(
        `/api/banners/${id}`,
        data
      )
      return response.data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['banners'] })
      queryClient.invalidateQueries({ queryKey: ['banner', variables.id] })
    },
  })
}

// Delete banner
export function useDeleteBanner() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/api/banners/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] })
    },
  })
}
