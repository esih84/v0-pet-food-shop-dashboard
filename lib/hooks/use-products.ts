'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Product, ProductVariant, ProductAttribute } from '@/lib/data'
import axiosInstance from '@/lib/auth/axios-instance'

export interface CreateProductInput {
  name: string
  description: string
  category: string
  status: 'active' | 'draft' | 'archived'
  variants: Omit<ProductVariant, 'id'>[]
  attributes: ProductAttribute[]
}

export interface UpdateProductInput extends Partial<CreateProductInput> {}

// Fetch all products
export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await axiosInstance.get<Product[]>('/api/products')
      return data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Fetch single product
export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await axiosInstance.get<Product>(`/api/products/${id}`)
      return data
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Create product
export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateProductInput) => {
      const { data } = await axiosInstance.post<Product>('/api/products', input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

// Update product
export function useUpdateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProductInput }) => {
      const response = await axiosInstance.put<Product>(
        `/api/products/${id}`,
        data
      )
      return response.data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] })
    },
  })
}

// Delete product
export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/api/products/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}
